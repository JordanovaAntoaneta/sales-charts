import React, { useEffect, useState } from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, scales } from 'chart.js';
import { Bar, Scatter } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Button } from '@mui/material';

Chart.register(Title, Tooltip, Legend, zoomPlugin);

interface SalesData {
    date: string;
    sales: number;
    expenses: number;
    profit: number;
    region: string;
    product_category: string;
    customer_segment: string;
    marketing_channel: string;
    customer_satisfaction: number;
    market_share: number;
    employee_count: number;
}

const ScatterSalesExpenses: React.FC = () => {
    const [data, setData] = useState<SalesData[]>([]);
    const [filteredData, setFilteredData] = useState<SalesData[]>([]);

    useEffect(() => {
        fetch('/SalesData.json')
            .then((response) => response.json())
            .then((data: SalesData[]) => {
                setData(data);
                setFilteredData(data);
            });
    }, []);

    function transformData() {
        return data.map(item => ({
            x: item.expenses,
            y: item.sales
        }));
    }

    const groupedData = transformData();

    const chartData = {
        datasets: [{
            label: 'Sales vs Expenses',
            data: groupedData,
            backgroundColor: 'rgb(251, 136, 174)'
        }]
    };

    return (
        <>
            <h2 style={{ fontSize: "1.5rem" }}>Sales vs Expenses</h2>
            <Scatter
                data={chartData}
                options={{
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Expenses'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Sales'
                            }
                        }

                    },
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false,
                        },
                        title: {
                            display: false,
                        },
                    },
                }}
            />
        </>
    );
}

export default ScatterSalesExpenses;