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

const CategoriesTab = ({ budgetData, legendProps, chartTextColor, categoryColors }) => {
    const [selectedPieIndex, setSelectedPieIndex] = useState(null);
    const categoryChartRef = useRef(null);
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handlePieClick = (data, index) => {
        if (isMobile) {
            setSelectedPieIndex(selectedPieIndex === index ? null : index);
        }
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

    return (
        <>
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
            
            {isMobile && selectedPieIndex === null && (
                <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                    Tap on a slice to see category details
                </Typography>
            )}
        </>
    );
};

export default CategoriesTab;
