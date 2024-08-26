import React, { useEffect, useReducer, useRef, useState } from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Box, Button, FormControl, FormLabel, InputLabel, MenuItem, Select, Typography } from '@mui/material';

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
};

//Interface for the action:
interface actionKindsType {
    type: actionKinds
    value: string
};

function reducer(state: stateType, action: actionKindsType) {
    const { type, value } = action;
    switch (type) {
        case actionKinds.startDate:
            return {
                ...state,
                startDate: value
            };
        case actionKinds.endDate:
            return {
                ...state,
                endDate: value
            };
        case actionKinds.chosenYear:
            return {
                ...state,
                chosenYear: value
            };
        case actionKinds.selectedCategory:
            return {
                ...state,
                selectedCategory: value
            };
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
    const labels: string[] = [];
    const categories = [
        "Food & Beverage",
        "Furniture",
        "Electronics",
        "Toys & Games",
        "Clothing",
        "Sports Equipment",
        "Books",
        "Health & Beauty"
    ];

    const groupedData = data.reduce((accumulator, entry: SalesData) => {
        const year = entry.date.substring(0, 4);

        if (!accumulator[year]) {
            accumulator[year] = {};
            categories.forEach(category => accumulator[year][category] = 0);
        }

        if (!labels.includes(year)) {
            labels.push(year);
        }

        if (categories.includes(entry.product_category)) {
            accumulator[year][entry.product_category] += entry.profit;
        }

        return accumulator;
    }, {} as { [year: string]: { [category: string]: number } });

    return { groupedData, labels, categories };
};

const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
        legend: {
            display: true,
        },
        title: {
            display: false,
            text: 'Yearly Profit by Product Category',
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

const ProfitPerCategoryChart: React.FC = () => {
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
            return (!state.startDate || year >= state.startDate) && (!state.endDate || year <= state.endDate) &&
                (!state.selectedCategory || entry.product_category === state.selectedCategory);
        });
        setFilteredData(filtered.length ? filtered : data);
    };

    useEffect(() => {
        filterData();
    }, [state.startDate, state.endDate, state.selectedCategory]);

    const { groupedData, labels, categories } = React.useMemo(() => transformData(filteredData), [filteredData]);

    const chartData = {
        labels: labels,
        datasets: categories.map((category, index) => ({
            label: category,
            data: labels.map(year => groupedData[year][category]),
            borderColor: [
                "#FF69B4",
                "yellow",
                "aquamarine",
                "#89CFF0",
                "#CBC3E3",
                "#AB47BC",
                "#FF9800",
                "#66BB6A"
            ][index % 8],
        })),
    };

    const chartRef = useRef<Chart<'line'>>(null);

    const resetFilters = () => {
        dispatch({ type: actionKinds.all, value: "" });
    };

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx}>Yearly Profit by Product Category</Typography>
            <Box sx={{ marginTop: 3 }}>
                <FormControl sx={{ marginLeft: 3 }}>
                    <InputLabel id="demo-simple-select-label">Filter by category</InputLabel>
                    <Select
                        labelId="filtering"
                        id='full-width-text-field'
                        value={state.selectedCategory}
                        label="Filter by year"
                        onChange={(e) => dispatch({ type: actionKinds.selectedCategory, value: e.target.value })}
                        sx={{ width: 200 }}
                    >
                        {
                            Array.from(new Set(data.map(label => label.product_category))).map((label: string) => <MenuItem value={label} key={label}>{label}</MenuItem>)
                        }
                    </Select>
                </FormControl>
                <Button onClick={() => { resetFilters() }} sx={buttonSx}>Reset filters</Button>
            </Box>
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
            </Box>

            <Line
                style={{ marginTop: '30px' }}
                data={chartData}
                options={chartOptions}
            />
        </>
    );
};

export default ProfitPerCategoryChart;