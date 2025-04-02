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

export default function BudgetGraphsModal({ open, onClose, db, user, currentMonth, selectedCategory, mode }) {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [budgetData, setBudgetData] = useState({
        totalSpent: 0,
        totalGoal: 0,
        categorySpent: 0,
        categoryGoal: 0,
        categoriesData: []
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    const chartTextColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined;

    const legendProps = useMemo(() => ({
        wrapperStyle: { color: chartTextColor },
        layout: isMobile ? 'horizontal' : 'vertical',
        verticalAlign: isMobile ? 'bottom' : 'middle',
        align: isMobile ? 'center' : 'right',
        ...(isMobile && { margin: { top: 10, bottom: 0 } })
    }), [isMobile, chartTextColor]);

    useEffect(() => {
        if (open && user && isValidMonth(currentMonth)) {
            fetchBudgetData();
        }
    }, [open, user, currentMonth, selectedCategory]);

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
                        gutterBottom 
                        align="center"
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
