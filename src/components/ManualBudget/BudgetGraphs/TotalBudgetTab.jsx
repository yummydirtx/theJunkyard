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

const TotalBudgetTab = ({ budgetData, legendProps, chartTextColor }) => {
    const [selectedBarIndex, setSelectedBarIndex] = useState(null);
    const totalChartRef = useRef(null);
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const barFillPrimary = theme.palette.mode === 'dark' ? '#71b7ff' : theme.palette.primary.main;
    const barFillSecondary = theme.palette.mode === 'dark' ? '#bb86fc' : theme.palette.secondary.main;

    const handleTotalBarClick = (data, index) => {
        if (isMobile) {
            setSelectedBarIndex(selectedBarIndex === index ? null : index);
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

    return (
        <>
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
        </>
    );
};

export default TotalBudgetTab;
