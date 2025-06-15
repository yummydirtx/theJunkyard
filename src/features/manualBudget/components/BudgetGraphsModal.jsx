// Copyright (c) 2025 Alex Frutkin
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (theJunkyard), to deal in
// theJunkyard without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// theJunkyard, and to permit persons to whom theJunkyard is furnished to do so,
// subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of theJunkyard.
// 
// THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

import { useState, useEffect, useMemo } from 'react';
import {
    Modal,
    Fade,
    Paper,
    Typography,
    Button,
    Box,
    Tab,
    Tabs,
    CircularProgress,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { collection, getDocs, getDoc, doc, setDoc } from 'firebase/firestore';

import TabPanel from './BudgetGraphs/TabPanel';
import TotalBudgetTab from './BudgetGraphs/TotalBudgetTab';
import CategoriesTab from './BudgetGraphs/CategoriesTab';
import SpecificCategoryTab from './BudgetGraphs/SpecificCategoryTab';
import { generateRandomColor, isValidMonth } from './BudgetGraphs/utils';

/**
 * BudgetGraphsModal displays various budget-related graphs (total budget, categories, specific category)
 * in a tabbed interface within a modal.
 * @param {object} props - The component's props.
 * @param {boolean} props.open - Controls the visibility of the modal.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {object} props.db - Firestore database instance.
 * @param {object} props.user - The authenticated user object.
 * @param {string} props.currentMonth - The current budget month (YYYY-MM) for which to display data.
 * @param {string} [props.selectedCategory] - The currently selected category, if any, for detailed view.
 * @param {string} props.mode - The current color mode ('light' or 'dark').
 * @param {boolean} [props.shouldRefreshGraphs] - Flag to trigger data refresh.
 * @param {function} [props.onGraphsRefreshed] - Callback when graphs have been refreshed.
 */
export default function BudgetGraphsModal({ 
    open, 
    onClose, 
    db, 
    user, 
    currentMonth, 
    selectedCategory, 
    mode,
    shouldRefreshGraphs,
    onGraphsRefreshed
}) {
    /** @state {number} tabValue - The index of the currently active tab. */
    const [tabValue, setTabValue] = useState(0);
    /** @state {boolean} loading - Indicates if budget data is currently being fetched. */
    const [loading, setLoading] = useState(true);
    /** @state {object} budgetData - Stores the fetched budget data for graphs.
     * @property {number} totalSpent - Overall total amount spent in the current month.
     * @property {number} totalGoal - Overall total budget goal for the current month.
     * @property {number} categorySpent - Total amount spent in the `selectedCategory`.
     * @property {number} categoryGoal - Budget goal for the `selectedCategory`.
     * @property {Array<object>} categoriesData - Array of objects, each representing a category's data.
     */
    const [budgetData, setBudgetData] = useState({
        totalSpent: 0,
        totalGoal: 0,
        categorySpent: 0,
        categoryGoal: 0,
        categoriesData: []
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Memoized object mapping category names to their colors (either user-defined or randomly generated).
    const categoryColors = useMemo(() => {
        const colors = {};
        budgetData.categoriesData.forEach(category => {
            if (!colors[category.name]) {
                // Use the stored color if available, otherwise generate a random color
                colors[category.name] = category.color || generateRandomColor();
            }
        });
        return colors;
    }, [budgetData.categoriesData]);

    // Determines the text color for chart elements based on the current theme mode.
    const chartTextColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined;

    // Memoized legend properties for charts, adapting to mobile view.
    const legendProps = useMemo(() => ({
        wrapperStyle: { color: chartTextColor },
        layout: isMobile ? 'horizontal' : 'vertical',
        verticalAlign: isMobile ? 'bottom' : 'middle',
        align: isMobile ? 'center' : 'right',
        ...(isMobile && { margin: { top: 10, bottom: 0 } })
    }), [isMobile, chartTextColor]);

    // Effect to fetch budget data when the modal is opened or relevant props change.
    useEffect(() => {
        if (open && user && isValidMonth(currentMonth)) {
            fetchBudgetData();
        }
    }, [open, user, currentMonth, selectedCategory]); // selectedCategory dependency ensures re-fetch if it changes while modal is open.

    // Effect to refresh data when shouldRefreshGraphs flag is set
    useEffect(() => {
        if (shouldRefreshGraphs && open && user && isValidMonth(currentMonth)) {
            fetchBudgetData();
            if (onGraphsRefreshed) {
                onGraphsRefreshed();
            }
        }
    }, [shouldRefreshGraphs, open, user, currentMonth]);

    /**
     * Fetches budget data for the current month from Firestore.
     * This includes overall totals and data for each category.
     * @async
     */
    const fetchBudgetData = async () => {
        setLoading(true);

        try {
            const monthDocRef = doc(db, `manualBudget/${user.uid}/months/${currentMonth}`);
            const monthDoc = await getDoc(monthDocRef);

            if (!monthDoc.exists()) {
                await setDoc(monthDocRef, {
                    total: 0,
                    createdAt: new Date()
                });
            }

            const monthData = monthDoc.data() || {};

            const categoriesCollectionRef = collection(db, `manualBudget/${user.uid}/months/${currentMonth}/categories`);
            const categoriesSnapshot = await getDocs(categoriesCollectionRef);

            let totalSpent = 0;
            let totalGoal = 0;
            let categorySpent = 0;
            let categoryGoal = 0;
            const categoriesData = [];

            categoriesSnapshot.forEach(doc => {
                const categoryData = doc.data() || {};
                const categoryName = doc.id;
                const categoryTotal = categoryData.total || 0;
                const categoryBudget = categoryData.goal || 0;
                const categoryColor = categoryData.color || null;

                totalSpent += categoryTotal;
                totalGoal += categoryBudget;

                if (categoryName === selectedCategory) {
                    categorySpent = categoryTotal;
                    categoryGoal = categoryBudget;
                }

                categoriesData.push({
                    name: categoryName,
                    value: categoryTotal,
                    budget: categoryBudget,
                    color: categoryColor // Store the user-specified color
                });
            });

            setBudgetData({
                totalSpent,
                totalGoal,
                categorySpent,
                categoryGoal,
                categoriesData
            });

            setLoading(false);
        } catch (error) {
            console.error("Error fetching budget data:", error);
            setLoading(false);
        }
    };

    /**
     * Handles changing the active tab in the modal.
     * @param {React.SyntheticEvent} event - The event source of the callback.
     * @param {number} newValue - The index of the new tab.
     */
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="budget-graphs-modal-title"
        >
            <Fade in={open}>
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '95%', sm: '80%', md: '70%' },
                        maxWidth: 900,
                        maxHeight: { xs: '95vh', sm: '90vh' },
                        overflow: 'auto',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: { xs: 2, sm: 4 },
                        borderRadius: 2,
                    }}
                >
                    <Typography 
                        id="budget-graphs-modal-title" 
                        variant={isMobile ? "h6" : "h5"} 
                        component="h2" 
                        align="center"
                        sx={{ mb: 2 }}
                    >
                        Budget Visualization
                    </Typography>

                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange}
                        variant={isMobile ? "scrollable" : "standard"}
                        centered={!isMobile}
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{ 
                            mb: 2,
                            '& .MuiTab-root': {
                                fontSize: isMobile ? '0.75rem' : 'inherit',
                                minWidth: isMobile ? 'auto' : 90,
                                px: isMobile ? 1 : 2
                            }
                        }}
                    >
                        <Tab label="Total Budget" />
                        <Tab label="Categories" />
                        {selectedCategory && <Tab label={isMobile ? selectedCategory : `${selectedCategory} Details`} />}
                    </Tabs>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TabPanel value={tabValue} index={0}>
                                <TotalBudgetTab
                                    budgetData={budgetData}
                                    legendProps={legendProps}
                                    chartTextColor={chartTextColor}
                                />
                            </TabPanel>

                            <TabPanel value={tabValue} index={1}>
                                <CategoriesTab 
                                    budgetData={budgetData}
                                    legendProps={legendProps}
                                    chartTextColor={chartTextColor}
                                    categoryColors={categoryColors}
                                />
                            </TabPanel>

                            {selectedCategory && (
                                <TabPanel value={tabValue} index={2}>
                                    <SpecificCategoryTab
                                        budgetData={budgetData}
                                        selectedCategory={selectedCategory}
                                        legendProps={legendProps}
                                        chartTextColor={chartTextColor}
                                    />
                                </TabPanel>
                            )}
                        </>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button variant="outlined" onClick={onClose}>Close</Button>
                    </Box>
                </Paper>
            </Fade>
        </Modal>
    );
}
