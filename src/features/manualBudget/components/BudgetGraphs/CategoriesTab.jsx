// Copyright (c) 2025 Alex Frutkin
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

import { useState, useRef } from 'react';
import {
    Typography,
    Box,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { PieTooltip } from './CustomTooltips';
import { formatCurrency } from './utils';

/**
 * CategoriesTab component displays a pie chart showing the spending distribution
 * across different budget categories. It allows users to see how much was spent
 * in each category relative to the total and to their individual budget goals.
 * On mobile, tapping a pie slice shows detailed information for that category.
 * @param {object} props - The component's props.
 * @param {object} props.budgetData - Data object containing budget information.
 * @param {Array<object>} props.budgetData.categoriesData - Array of category data objects.
 * @param {string} props.budgetData.categoriesData[].name - Name of the category.
 * @param {number} props.budgetData.categoriesData[].value - Amount spent in the category.
 * @param {number} props.budgetData.categoriesData[].budget - Budget goal for the category.
 * @param {number} props.budgetData.totalSpent - Total amount spent across all categories.
 * @param {object} props.legendProps - Props to be passed to the Recharts Legend component.
 * @param {string} props.chartTextColor - Color for the text elements within the chart (labels).
 * @param {object} props.categoryColors - An object mapping category names to their hex color codes.
 */
const CategoriesTab = ({ budgetData, legendProps, chartTextColor, categoryColors }) => {
    /** @state {number|null} selectedPieIndex - Index of the currently selected pie slice. Null if no slice is selected. Used for mobile interaction. */
    const [selectedPieIndex, setSelectedPieIndex] = useState(null);
    /** @ref {object} categoryChartRef - Ref for the chart container Box element. */
    const categoryChartRef = useRef(null);
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const filteredData = budgetData?.categoriesData?.filter(item => item.value > 0) || [];
    const budgetData_forDisplay = filteredData.length > 0 ? filteredData : (budgetData?.categoriesData?.filter(item => item.budget > 0) || []);
    
    const isShowingBudgets = filteredData.length === 0 && budgetData_forDisplay.length > 0;

    /**
     * Handles clicks on the pie slices of the category chart.
     * On mobile, it toggles the selection of a slice to display its details.
     * @param {object} data - The data associated with the clicked pie slice.
     * @param {number} index - The index of the clicked pie slice.
     */
    const handlePieClick = (data, index) => {
        if (isMobile) {
            setSelectedPieIndex(selectedPieIndex === index ? null : index);
        }
    };

    /**
     * Renders detailed information about the selected category (pie slice).
     * This includes amount spent, budget goal, percentage of total spending, and budget status.
     * This is primarily used on mobile devices when a pie slice is tapped.
     * @returns {JSX.Element|null} A Box component with details, or null if no slice is selected or data is invalid.
     */
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

    return (
        <>
            <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom align="center">
                Spending Distribution by Category
            </Typography>
            
            {/* Show message if no spending data */}
            {(!budgetData?.categoriesData || budgetData.categoriesData.filter(item => item.value > 0).length === 0) ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        No spending data available for this month.
                    </Typography>
                    {budgetData?.categoriesData && budgetData.categoriesData.length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            You have {budgetData.categoriesData.length} categories set up. Add some expenses to see the spending distribution.
                        </Typography>
                    )}
                </Box>
            ) : (
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
                            <Tooltip content={<PieTooltip totalSpent={budgetData.totalSpent} />} />
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
            )}
            
            {isMobile && selectedPieIndex === null && budgetData?.categoriesData?.filter(item => item.value > 0).length > 0 && (
                <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                    Tap on a slice to see category details
                </Typography>
            )}
        </>
    );
};

export default CategoriesTab;
