import React, { useEffect, useReducer, useState } from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Box, Button, FormControl, FormLabel, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { ChartOptions } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, zoomPlugin);

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

//Actions:
enum actionKinds {
    startDate = 'startDate',
    endDate = 'endDate',
    chosenYear = 'chosenYear',
    selectedCategory = 'selectedCategory',
    all = 'all'
}

//Interface for the state:
interface stateType {
    startDate: string,
    endDate: string,
    chosenYear: string,
    selectedCategory: string,
    all: {
        startDate: string,
        endDate: string,
        chosenYear: string,
        selectedCategory: string,
    }
}

//Interface for the action:
interface actionKindsType {
    type: actionKinds,
    value: string
}

function reducer(state: stateType, action: actionKindsType) {
    const { type, value } = action;
    switch (type) {
        case actionKinds.startDate: {
            return {
                ...state,
                startDate: value,
            }
        }
        case actionKinds.endDate: {
            return {
                ...state,
                endDate: value,
            }
        }
        case actionKinds.chosenYear: {
            return {
                ...state,
                chosenYear: value,
            }
        }
        case actionKinds.selectedCategory: {
            return {
                ...state,
                selectedCategory: value
            }
        }
        case actionKinds.all: {
            return {
                ...state,
                startDate: value,
                endDate: value,
                chosenYear: value,
                selectedCategory: value,
            }
        }
        default:
            return state;
    }
};


const transformData = (filteredData: SalesData[]) => {

    const groupedData = filteredData.reduce((accumulator, item) => {
        const year = new Date(item.date).getFullYear().toString();
        if (!accumulator[year]) {
            accumulator[year] = { sales: 0, expenses: 0, profit: 0 };
        }
        accumulator[year].sales += item.sales;
        accumulator[year].expenses += item.expenses;
        accumulator[year].profit += item.profit;

        return accumulator;
    }, {} as { [year: string]: { sales: number, expenses: number, profit: number } });

    return Object.keys(groupedData).map(year => ({
        year,
        ...groupedData[year]
    }));
};

const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: false,
            text: 'Yearly Sales, Expenses, and Profit',
        },
    },
    scales: {
        x: {
            title: {
                display: false,
                text: 'Year',
            },
        },
        y: {
            title: {
                display: false,
                text: 'Amount',
            },
        },
    },
};

const buttonSx = () => {
    return {
        backgroundImage: 'linear-gradient(#f9b6ca, rgb(251, 136, 174))',
        border: '0',
        borderRadius: '4px',
        boxShadow: 'rgba(0, 0, 0, .15) 0 5px 15px',
        boxSizing: 'border-box',
        color: 'white',
        cursor: 'pointer',
        marginRight: '5px',
        marginLeft: '20px',
        padding: '18px',
        textAlign: 'center',
        userSelect: 'none',
        fontSize: '8pt',
        webkitUserSelect: 'none',
        touchAction: 'manipulation',
    };
}

const chartTitleSx = () => {
    return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        fontSize: "1.5rem",
        fontWeight: "bold",
        marginTop: 3
    }
}

const LineProfitSalesExpensesChart: React.FC = () => {
    const [data, setData] = useState<SalesData[]>([]);
    const [filteredData, setFilteredData] = useState<SalesData[]>([]);
    const [state, dispatch] = useReducer(reducer, { startDate: '', endDate: '', chosenYear: '', selectedCategory: '', all: { startDate: '', endDate: '', chosenYear: '', selectedCategory: '' } });

    useEffect(() => {
        fetch('/SalesData.json')
            .then((response) => response.json())
            .then((data: SalesData[]) => {
                setData(data);
                setFilteredData(data);
            });
    }, []);



    const filterData = () => {
        const filtered = data.filter(entry => {
            const year = entry.date.substring(0, 4);
            return (!state.startDate || year >= state.startDate) && (!state.endDate || year <= state.endDate);
        });
        setFilteredData(filtered.length ? filtered : data);
    };

    useEffect(() => {
        filterData();
    }, [state.startDate, state.endDate]);

    const transformedData = React.useMemo(() => transformData(filteredData), [filteredData]);

    const chartData = {
        labels: transformedData.map((item: { year: string; }) => item.year),
        datasets: [
            {
                label: 'Sales',
                data: transformedData.map((item: { sales: number; }) => item.sales),
                borderColor: "#89CFF0",
                fill: false,
            },
            {
                label: 'Expenses',
                data: transformedData.map((item: { expenses: number; }) => item.expenses),
                borderColor: '#AB47BC',
                fill: false,
            },
            {
                label: 'Profit',
                data: transformedData.map((item: { profit: number; }) => item.profit),
                borderColor: '#FF9800',
                fill: false,
            },
        ],
    };


    const resetFilters = () => {
        dispatch({ type: actionKinds.all, value: "" });
    }

    return (
        <>
            <Typography sx={chartTitleSx}>Yearly Profit, Sales and Expenses</Typography>
            <Box sx={{ marginTop: 3 }}>
                <FormLabel
                    className='timeperiod'
                    sx={{ marginLeft: 3 }}
                >
                    Filter by time period:
                </FormLabel>
                <FormControl sx={{ marginLeft: 3 }}>
                    <InputLabel id="demo-simple-select-label">Starting year</InputLabel>
                    <Select
                        labelId="start"
                        id='full-width-text-field'
                        value={state.startDate}
                        label="Starting year"
                        onChange={(e) => dispatch({ type: actionKinds.startDate, value: e.target.value })}
                        sx={{ width: 200 }}
                    >
                        {
                            Array.from(new Set(data.map(label => label.date.substring(0, 4)))).map((label: string) => <MenuItem value={label} key={label}>{label}</MenuItem>)
                        }
                    </Select>
                </FormControl>
                <FormControl sx={{ marginLeft: 3 }}>
                    <InputLabel id="demo-simple-select-label">Ending year</InputLabel>
                    <Select
                        labelId="end"
                        id='full-width-text-field'
                        className="end"
                        value={state.endDate}
                        label="Ending year"
                        onChange={(e) => dispatch({ type: actionKinds.endDate, value: e.target.value })}
                        sx={{ width: 200 }}
                    >
                        {
                            Array.from(new Set(data.map(label => label.date.substring(0, 4)))).map((label: string) => <MenuItem value={label} key={label}>{label}</MenuItem>)
                        }
                    </Select>
                </FormControl>
                <Button
                    onClick={() => { resetFilters() }}
                    sx={buttonSx}
                >
                    Reset filters
                </Button>
            </Box>

            <Line
                style={{ marginTop: '30px' }}
                data={chartData}
                options={chartOptions}
            />

        </>
    );
}

export default LineProfitSalesExpensesChart;