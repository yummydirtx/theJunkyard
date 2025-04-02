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

import { useState, useEffect, useMemo, useRef } from 'react';
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
    
    const [selectedBarIndex, setSelectedBarIndex] = useState(null);
    const [selectedPieIndex, setSelectedPieIndex] = useState(null);
    const [selectedCategoryBarIndex, setSelectedCategoryBarIndex] = useState(null);
    
    const totalChartRef = useRef(null);
    const categoryChartRef = useRef(null);
    const specificCategoryChartRef = useRef(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));

    const generateRandomColor = () => {
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(60 + Math.random() * 40);
        const l = Math.floor(40 + Math.random() * 30);
        return `hsl(${h}, ${s}%, ${l}%)`;
    };

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
    const barFillPrimary = theme.palette.mode === 'dark' ? '#71b7ff' : theme.palette.primary.main;
    const barFillSecondary = theme.palette.mode === 'dark' ? '#bb86fc' : theme.palette.secondary.main;

    const legendProps = useMemo(() => ({
        wrapperStyle: { color: chartTextColor },
        layout: isMobile ? 'horizontal' : 'vertical',
        verticalAlign: isMobile ? 'bottom' : 'middle',
        align: isMobile ? 'center' : 'right',
        ...(isMobile && { margin: { top: 10, bottom: 0 } })
    }), [isMobile, chartTextColor]);

    const isValidMonth = (month) => {
        return month && /^\d{4}-\d{2}$/.test(month);
    };

    useEffect(() => {
        if (open && user && isValidMonth(currentMonth)) {
            fetchBudgetData();
        }
    }, [open, user, currentMonth, selectedCategory]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobile) {
                if (tabValue === 0 && totalChartRef.current && 
                    !totalChartRef.current.contains(event.target)) {
                    setSelectedBarIndex(null);
                } else if (tabValue === 1 && categoryChartRef.current && 
                    !categoryChartRef.current.contains(event.target)) {
                    setSelectedPieIndex(null);
                } else if (tabValue === 2 && specificCategoryChartRef.current && 
                    !specificCategoryChartRef.current.contains(event.target)) {
                    setSelectedCategoryBarIndex(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [tabValue, isMobile]);

    useEffect(() => {
        setSelectedBarIndex(null);
        setSelectedPieIndex(null);
        setSelectedCategoryBarIndex(null);
    }, [tabValue]);

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

    const handleTotalBarClick = (data, index) => {
        if (isMobile) {
            setSelectedBarIndex(selectedBarIndex === index ? null : index);
        }
    };

    const handlePieClick = (data, index) => {
        if (isMobile) {
            setSelectedPieIndex(selectedPieIndex === index ? null : index);
        }
    };

    const handleCategoryBarClick = (data, index) => {
        if (isMobile) {
            setSelectedCategoryBarIndex(selectedCategoryBarIndex === index ? null : index);
        }
    };

    const renderTotalBudgetDetails = () => {
        if (selectedBarIndex === null) return null;
        
        const data = [
            { name: 'Spent', value: budgetData.totalSpent },
            { name: 'Budget', value: budgetData.totalGoal }
        ][selectedBarIndex];
        
        return (
            <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                boxShadow: 1
            }}>
                <Typography variant="subtitle2" gutterBottom>
                    {data.name} Details:
                </Typography>
                <Typography variant="body2">
                    {data.name === 'Spent' ? 'Amount spent this month:' : 'Total budget goal:'}
                </Typography>
                <Typography variant="h6" color={data.name === 'Spent' ? 'primary' : 'secondary'}>
                    {formatCurrency(data.value)}
                </Typography>
                {data.name === 'Spent' && budgetData.totalGoal > 0 && (
                    <Typography variant="body2" 
                        color={budgetData.totalSpent > budgetData.totalGoal ? "error" : "success"}>
                        {budgetData.totalSpent > budgetData.totalGoal ? 'Over budget by ' : 'Under budget by '}
                        {formatCurrency(Math.abs(budgetData.totalSpent - budgetData.totalGoal))}
                    </Typography>
                )}
            </Box>
        );
    };

    const renderCategoryDetails = () => {
        if (selectedPieIndex === null) return null;
        
        const filteredCategories = budgetData.categoriesData.filter(item => item.value > 0);
        if (selectedPieIndex >= filteredCategories.length) return null;
        
        const category = filteredCategories[selectedPieIndex];
        
        return (
            <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                boxShadow: 1
            }}>
                <Typography variant="subtitle2" gutterBottom>
                    {category.name}
                </Typography>
                <Typography variant="body2">
                    Amount spent:
                </Typography>
                <Typography variant="h6" color="primary">
                    {formatCurrency(category.value)}
                </Typography>
                <Typography variant="body2">
                    Budget goal: {formatCurrency(category.budget)}
                </Typography>
                <Typography variant="body2">
                    Percentage of total spending: {((category.value / budgetData.totalSpent) * 100).toFixed(1)}%
                </Typography>
                {category.budget > 0 && (
                    <Typography variant="body2" 
                        color={category.value > category.budget ? "error" : "success"}>
                        {category.value > category.budget ? 'Over budget by ' : 'Under budget by '}
                        {formatCurrency(Math.abs(category.value - category.budget))}
                    </Typography>
                )}
            </Box>
        );
    };

    const renderSpecificCategoryDetails = () => {
        if (selectedCategoryBarIndex === null) return null;
        
        const data = [
            { name: 'Spent', value: budgetData.categorySpent },
            { name: 'Budget', value: budgetData.categoryGoal }
        ][selectedCategoryBarIndex];
        
        return (
            <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                boxShadow: 1
            }}>
                <Typography variant="subtitle2" gutterBottom>
                    {selectedCategory}: {data.name}
                </Typography>
                <Typography variant="body2">
                    {data.name === 'Spent' ? `Amount spent in ${selectedCategory}:` : `Budget goal for ${selectedCategory}:`}
                </Typography>
                <Typography variant="h6" color={data.name === 'Spent' ? 'primary' : 'secondary'}>
                    {formatCurrency(data.value)}
                </Typography>
                {data.name === 'Spent' && budgetData.categoryGoal > 0 && (
                    <Typography variant="body2" 
                        color={budgetData.categorySpent > budgetData.categoryGoal ? "error" : "success"}>
                        {budgetData.categorySpent > budgetData.categoryGoal ? 'Over budget by ' : 'Under budget by '}
                        {formatCurrency(Math.abs(budgetData.categorySpent - budgetData.categoryGoal))}
                    </Typography>
                )}
            </Box>
        );
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
                                <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom align="center">
                                    Total Spending vs. Budget Goal
                                </Typography>
                                <Box ref={totalChartRef}>
                                    <ResponsiveContainer width="100%" height={isMobile ? 250 : 400}>
                                        <BarChart
                                            data={[
                                                { name: 'Spent', value: budgetData.totalSpent },
                                                { name: 'Budget', value: budgetData.totalGoal }
                                            ]}
                                            margin={{ 
                                                top: 20, 
                                                right: isMobile ? 10 : 30, 
                                                left: isMobile ? 10 : 20, 
                                                bottom: isMobile ? 20 : 30 
                                            }}
                                        >
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fill: chartTextColor, fontSize: isMobile ? 12 : 14 }}
                                            />
                                            <YAxis
                                                tickFormatter={(value) => isMobile ? `$${Math.round(value)}` : `$${value}`}
                                                tick={{ fill: chartTextColor, fontSize: isMobile ? 12 : 14 }}
                                                width={isMobile ? 40 : 60}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend {...legendProps} />
                                            <Bar
                                                dataKey="value"
                                                name="Amount"
                                                fill={barFillPrimary}
                                                onClick={handleTotalBarClick}
                                                cursor={isMobile ? "pointer" : undefined}
                                            >
                                                {[0, 1].map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`}
                                                        fill={selectedBarIndex === index && isMobile ? 
                                                            theme.palette.mode === 'dark' ? '#afd4ff' : '#2a6bff' : 
                                                            index === 0 ? barFillPrimary : barFillSecondary}
                                                        stroke={selectedBarIndex === index && isMobile ? 
                                                            theme.palette.mode === 'dark' ? '#ffffff' : '#000000' : undefined}
                                                        strokeWidth={selectedBarIndex === index && isMobile ? 2 : 0}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                    
                                    {isMobile && renderTotalBudgetDetails()}
                                    
                                    {!isMobile && (
                                        <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                                            Total Spent: {formatCurrency(budgetData.totalSpent)} / Goal: {formatCurrency(budgetData.totalGoal)}
                                            {budgetData.totalGoal > 0 && (
                                                <Typography component="span" color={budgetData.totalSpent > budgetData.totalGoal ? "error" : "inherit"}>
                                                    {' '}({((budgetData.totalSpent / budgetData.totalGoal) * 100).toFixed(1)}%)
                                                </Typography>
                                            )}
                                        </Typography>
                                    )}
                                </Box>
                                
                                {isMobile && selectedBarIndex === null && (
                                    <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                                        Tap on a bar to see details
                                    </Typography>
                                )}
                            </TabPanel>

                            <TabPanel value={tabValue} index={1}>
                                <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom align="center">
                                    Spending Distribution by Category
                                </Typography>
                                <Box ref={categoryChartRef}>
                                    <ResponsiveContainer width="100%" height={isMobile ? 250 : 400}>
                                        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                            <Pie
                                                data={budgetData.categoriesData.filter(item => item.value > 0)}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={!isMobile}
                                                label={isMobile ? 
                                                    false : 
                                                    ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`
                                                }
                                                labelStyle={{ fill: chartTextColor }}
                                                outerRadius={isMobile ? 80 : 150}
                                                innerRadius={isMobile ? 30 : 0}
                                                fill="#8884d8"
                                                dataKey="value"
                                                paddingAngle={isMobile ? 2 : 0}
                                                onClick={handlePieClick}
                                                cursor={isMobile ? "pointer" : undefined}
                                            >
                                                {budgetData.categoriesData.filter(item => item.value > 0).map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${entry.name}`}
                                                        fill={categoryColors[entry.name]}
                                                        stroke={selectedPieIndex === index && isMobile ? 
                                                            theme.palette.mode === 'dark' ? '#ffffff' : '#000000' : undefined}
                                                        strokeWidth={selectedPieIndex === index && isMobile ? 2 : 0}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<PieTooltip />} />
                                            <Legend 
                                                {...legendProps}
                                                formatter={(value, entry, index) => {
                                                    if (isMobile && value.length > 12) {
                                                        return value.substring(0, 10) + '...';
                                                    }
                                                    return value;
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    
                                    {isMobile && renderCategoryDetails()}
                                </Box>
                                
                                {isMobile && selectedPieIndex === null && (
                                    <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                                        Tap on a slice to see category details
                                    </Typography>
                                )}
                            </TabPanel>

                            {selectedCategory && (
                                <TabPanel value={tabValue} index={2}>
                                    <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom align="center">
                                        {selectedCategory} Spending vs. Goal
                                    </Typography>
                                    <Box ref={specificCategoryChartRef}>
                                        <ResponsiveContainer width="100%" height={isMobile ? 250 : 400}>
                                            <BarChart
                                                data={[
                                                    { name: 'Spent', value: budgetData.categorySpent },
                                                    { name: 'Budget', value: budgetData.categoryGoal }
                                                ]}
                                                margin={{ 
                                                    top: 20, 
                                                    right: isMobile ? 10 : 30, 
                                                    left: isMobile ? 10 : 20, 
                                                    bottom: isMobile ? 20 : 30 
                                                }}
                                            >
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fill: chartTextColor, fontSize: isMobile ? 12 : 14 }}
                                                />
                                                <YAxis
                                                    tickFormatter={(value) => isMobile ? `$${Math.round(value)}` : `$${value}`}
                                                    tick={{ fill: chartTextColor, fontSize: isMobile ? 12 : 14 }}
                                                    width={isMobile ? 40 : 60}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend {...legendProps} />
                                                <Bar
                                                    dataKey="value"
                                                    name="Amount"
                                                    fill={barFillSecondary}
                                                    onClick={handleCategoryBarClick}
                                                    cursor={isMobile ? "pointer" : undefined}
                                                >
                                                    {[0, 1].map((entry, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`}
                                                            fill={selectedCategoryBarIndex === index && isMobile ? 
                                                                theme.palette.mode === 'dark' ? '#d7b8ff' : '#9c27b0' : 
                                                                barFillSecondary}
                                                            stroke={selectedCategoryBarIndex === index && isMobile ? 
                                                                theme.palette.mode === 'dark' ? '#ffffff' : '#000000' : undefined}
                                                            strokeWidth={selectedCategoryBarIndex === index && isMobile ? 2 : 0}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                        
                                        {isMobile && renderSpecificCategoryDetails()}
                                        
                                        {!isMobile && (
                                            <Typography variant={isMobile ? "body2" : "body1"} align="center" sx={{ mt: 2 }}>
                                                {isMobile ? 'Spent:' : `${selectedCategory} Spent:`} {formatCurrency(budgetData.categorySpent)} / Goal: {formatCurrency(budgetData.categoryGoal)}
                                                {budgetData.categoryGoal > 0 && (
                                                    <Typography component="span" color={budgetData.categorySpent > budgetData.categoryGoal ? "error" : "inherit"}>
                                                        {' '}({((budgetData.categorySpent / budgetData.categoryGoal) * 100).toFixed(1)}%)
                                                    </Typography>
                                                )}
                                            </Typography>
                                        )}
                                    </Box>
                                    
                                    {isMobile && selectedCategoryBarIndex === null && (
                                        <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                                            Tap on a bar to see details
                                        </Typography>
                                    )}
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
