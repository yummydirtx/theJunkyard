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
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Cell,
    ResponsiveContainer
} from 'recharts';
import { CustomTooltip } from './CustomTooltips';
import { formatCurrency } from './utils';

const SpecificCategoryTab = ({ budgetData, selectedCategory, legendProps, chartTextColor }) => {
    const [selectedCategoryBarIndex, setSelectedCategoryBarIndex] = useState(null);
    const specificCategoryChartRef = useRef(null);
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const barFillSecondary = theme.palette.mode === 'dark' ? '#bb86fc' : theme.palette.secondary.main;

    const handleCategoryBarClick = (data, index) => {
        if (isMobile) {
            setSelectedCategoryBarIndex(selectedCategoryBarIndex === index ? null : index);
        }
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
        <>
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
        </>
    );
};

export default SpecificCategoryTab;
