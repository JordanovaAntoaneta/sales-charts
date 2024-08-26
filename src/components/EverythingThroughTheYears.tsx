
import { CategoryScale, Chart, ChartOptions, Legend, LinearScale, LineElement, Title, Tooltip } from "chart.js";
import React, { useState, useEffect, useReducer } from "react";
import { Line } from "react-chartjs-2";
import zoomPlugin from 'chartjs-plugin-zoom';
import { Box, Button, FormControl, FormLabel, InputLabel, MenuItem, Select, Typography } from '@mui/material';

Chart.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, zoomPlugin);

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

const transformData = (data: SalesData[]) => {
    const groupedData = data.reduce((accumulator, item) => {
        const year = new Date(item.date).getFullYear().toString();
        if (!accumulator[year]) {
            accumulator[year] = { sales: 0, expenses: 0, profit: 0, satisfaction: 0.0, market_share: 0.0, count: 0, categories: {} };
        }

        accumulator[year].sales += item.sales;
        accumulator[year].expenses += item.expenses;
        accumulator[year].profit += item.profit;
        accumulator[year].satisfaction += item.customer_satisfaction;
        accumulator[year].market_share += item.market_share;
        accumulator[year].count += 1;

        return accumulator;

    }, {} as { [year: string]: { sales: number, expenses: number, profit: number, satisfaction: number, market_share: number, count: number, categories: { [category: string]: number } } });

    return Object.keys(groupedData).map(year => ({
        year,
        sales: groupedData[year].sales,
        expenses: groupedData[year].expenses,
        profit: groupedData[year].profit,
        satisfaction: groupedData[year].satisfaction / groupedData[year].count,
        market_share: groupedData[year].market_share / groupedData[year].count,
        categories: groupedData[year].categories
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
            type: 'linear',
            display: true,
            position: 'left',
            title: {
                display: false,
                text: 'Amount',
            },
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
                drawOnChartArea: false,
            },
            title: {
                display: false,
                text: 'Percentage',
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

const EverythingThroughTheYears: React.FC = () => {
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
        labels: transformedData.map((item: { year: any; }) => item.year),
        datasets: [
            {
                label: 'Sales',
                data: transformedData.map((item: { sales: any; }) => item.sales),
                borderColor: "#29d2f2",
                fill: false,
                yAxisID: 'y',
            },
            {
                label: 'Expenses',
                data: transformedData.map((item: { expenses: any; }) => item.expenses),
                borderColor: '#70d46c',
                fill: false,
                yAxisID: 'y',
            },
            {
                label: 'Profit',
                data: transformedData.map((item: { profit: any; }) => item.profit),
                borderColor: '#f28abf',
                fill: false,
                yAxisID: 'y',
            },
            {
                label: 'Customer Satisfaction',
                data: transformedData.map((item: { satisfaction: any; }) => item.satisfaction),
                borderColor: '#e3c476',
                fill: false,
                yAxisID: 'y1',
            },
            {
                label: 'Market Share',
                data: transformedData.map((item: { market_share: any; }) => item.market_share),
                borderColor: '#cb7dfa',
                fill: false,
                yAxisID: 'y1',
            },
        ],
    };

    const resetFilters = () => {
        dispatch({ type: actionKinds.all, value: "" });
    }

    return (
        <>
            <Typography sx={chartTitleSx}>Profit, Sales, Expenses, Market shares and Customer satisfaction by Year</Typography>
            <Box sx={{ marginTop: 3 }}>
                <FormLabel sx={{ marginLeft: 3 }}>Filter by time period:</FormLabel>
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
                            Array.from(new Set(data.map(label => label.date.split("-")[0]))).map((label: string) => <MenuItem value={label} key={label}>{label}</MenuItem>)
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
                            Array.from(new Set(data.map(label => label.date.split("-")[0]))).map((label: string) => <MenuItem value={label} key={label}>{label}</MenuItem>)
                        }
                    </Select>
                </FormControl>
                <Button onClick={() => { resetFilters() }} sx={buttonSx}>Reset filters</Button>
            </Box>

            <Line
                style={{ marginTop: '30px' }}
                data={chartData}
                options={chartOptions}
            />
        </>
    );
}

export default EverythingThroughTheYears;