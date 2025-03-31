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
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`budget-graph-tabpanel-${index}`}
            aria-labelledby={`budget-graph-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 2 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

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

    // Function to generate random colors that are visually distinct
    const generateRandomColor = () => {
        const h = Math.floor(Math.random() * 360); // Hue (0-360)
        const s = Math.floor(60 + Math.random() * 40); // Saturation (60-100%)
        const l = Math.floor(40 + Math.random() * 30); // Lightness (40-70%)
        return `hsl(${h}, ${s}%, ${l}%)`;
    };

    // Generate random colors for categories and memoize them
    const categoryColors = useMemo(() => {
        const colors = {};
        budgetData.categoriesData.forEach(category => {
            if (!colors[category.name]) {
                colors[category.name] = generateRandomColor();
            }
        });
        return colors;
    }, [budgetData.categoriesData]);

    // Define chart theme-specific styles
    const chartTextColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined;
    const barFillPrimary = theme.palette.mode === 'dark' ? '#71b7ff' : theme.palette.primary.main;
    const barFillSecondary = theme.palette.mode === 'dark' ? '#bb86fc' : theme.palette.secondary.main;

    const isValidMonth = (month) => {
        return month && /^\d{4}-\d{2}$/.test(month);
    };

    useEffect(() => {
        if (open && user && isValidMonth(currentMonth)) {
            fetchBudgetData();
        }
    }, [open, user, currentMonth, selectedCategory]);

    const fetchBudgetData = async () => {
        setLoading(true);

        try {
            console.log(`Fetching budget data for month: ${currentMonth}`);

            const monthDocRef = doc(db, `manualBudget/${user.uid}/months/${currentMonth}`);
            const monthDoc = await getDoc(monthDocRef);

            if (!monthDoc.exists()) {
                console.log(`Month document ${currentMonth} does not exist, creating it`);
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

                totalSpent += categoryTotal;
                totalGoal += categoryBudget;

                if (categoryName === selectedCategory) {
                    categorySpent = categoryTotal;
                    categoryGoal = categoryBudget;
                }

                categoriesData.push({
                    name: categoryName,
                    value: categoryTotal,
                    budget: categoryBudget
                });
            });

            console.log(`Loaded ${categoriesData.length} categories`);

            setBudgetData({
                totalSpent,
                totalGoal,
                categorySpent,
                categoryGoal,
                categoriesData
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching budget data:', error);
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    bgcolor: 'background.paper',
                    p: 1,
                    border: '1px solid #ccc',
                    boxShadow: 2
                }}>
                    <Typography variant="body2">{payload[0].name}</Typography>
                    <Typography variant="body2" color="primary">
                        {payload[0].name === 'Budget' ? 'Goal: ' : 'Spent: '}
                        {formatCurrency(payload[0].value)}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    bgcolor: 'background.paper',
                    p: 1,
                    border: '1px solid #ccc',
                    boxShadow: 2
                }}>
                    <Typography variant="body2">{payload[0].name}</Typography>
                    <Typography variant="body2">
                        Amount: {formatCurrency(payload[0].value)}
                    </Typography>
                    <Typography variant="body2">
                        Percentage: {((payload[0].value / budgetData.totalSpent) * 100).toFixed(1)}%
                    </Typography>
                </Box>
            );
        }
        return null;
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
                        maxHeight: '90vh',
                        overflow: 'auto',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: { xs: 2, sm: 4 },
                        borderRadius: 2,
                    }}
                >
                    <Typography id="budget-graphs-modal-title" variant="h5" component="h2" gutterBottom>
                        Budget Visualization
                    </Typography>

                    <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 2 }}>
                        <Tab label="Total Budget" />
                        <Tab label="Categories Distribution" />
                        {selectedCategory && <Tab label={`${selectedCategory} Details`} />}
                    </Tabs>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TabPanel value={tabValue} index={0}>
                                <Typography variant="h6" gutterBottom align="center">
                                    Total Spending vs. Budget Goal
                                </Typography>
                                <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                                    <BarChart
                                        data={[
                                            { name: 'Spent', value: budgetData.totalSpent },
                                            { name: 'Budget', value: budgetData.totalGoal }
                                        ]}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                    >
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: chartTextColor }}
                                        />
                                        <YAxis
                                            tickFormatter={(value) => `$${value}`}
                                            tick={{ fill: chartTextColor }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ color: chartTextColor }} />
                                        <Bar
                                            dataKey="value"
                                            name="Amount"
                                            fill={barFillPrimary}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                                <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                                    Total Spent: {formatCurrency(budgetData.totalSpent)} / Budget Goal: {formatCurrency(budgetData.totalGoal)}
                                    {budgetData.totalGoal > 0 && (
                                        <Typography component="span" color={budgetData.totalSpent > budgetData.totalGoal ? "error" : "inherit"}>
                                            {' '}({((budgetData.totalSpent / budgetData.totalGoal) * 100).toFixed(1)}%)
                                        </Typography>
                                    )}
                                </Typography>
                            </TabPanel>

                            <TabPanel value={tabValue} index={1}>
                                <Typography variant="h6" gutterBottom align="center">
                                    Spending Distribution by Category
                                </Typography>
                                <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                                    <PieChart>
                                        <Pie
                                            data={budgetData.categoriesData.filter(item => item.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            labelStyle={{ fill: chartTextColor }}
                                            outerRadius={isMobile ? 100 : 150}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {budgetData.categoriesData.map((entry) => (
                                                <Cell
                                                    key={`cell-${entry.name}`}
                                                    fill={categoryColors[entry.name]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </TabPanel>

                            {selectedCategory && (
                                <TabPanel value={tabValue} index={2}>
                                    <Typography variant="h6" gutterBottom align="center">
                                        {selectedCategory} Spending vs. Budget Goal
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                                        <BarChart
                                            data={[
                                                { name: 'Spent', value: budgetData.categorySpent },
                                                { name: 'Budget', value: budgetData.categoryGoal }
                                            ]}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                        >
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fill: chartTextColor }}
                                            />
                                            <YAxis
                                                tickFormatter={(value) => `$${value}`}
                                                tick={{ fill: chartTextColor }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ color: chartTextColor }} />
                                            <Bar
                                                dataKey="value"
                                                name="Amount"
                                                fill={barFillSecondary}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                                        {selectedCategory} Spent: {formatCurrency(budgetData.categorySpent)} / Budget Goal: {formatCurrency(budgetData.categoryGoal)}
                                        {budgetData.categoryGoal > 0 && (
                                            <Typography component="span" color={budgetData.categorySpent > budgetData.categoryGoal ? "error" : "inherit"}>
                                                {' '}({((budgetData.categorySpent / budgetData.categoryGoal) * 100).toFixed(1)}%)
                                            </Typography>
                                        )}
                                    </Typography>
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
