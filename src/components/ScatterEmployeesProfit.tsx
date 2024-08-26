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

const ScatterEmployeeProfit: React.FC = () => {
    const [data, setData] = useState<SalesData[]>([]);

    useEffect(() => {
        fetch('/SalesData.json')
            .then((response) => response.json())
            .then((data: SalesData[]) => {
                setData(data);
            });
    }, []);

    function transformData() {
        return data.map(item => ({
            x: item.employee_count,
            y: item.profit
        }));
    }

    const groupedData = transformData();

    const chartData = {
        datasets: [{
            label: 'Profit vs Number of employees',
            data: groupedData,
            backgroundColor: '#FF9800'
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
                                text: 'Number of employees'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Profit'
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

export default ScatterEmployeeProfit;