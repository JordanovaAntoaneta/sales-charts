import React, { useEffect, useReducer, useState } from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
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
    region = 'region',
    all = 'all'
}

//Interface for the state:
interface stateType {
    startDate: string,
    endDate: string,
    chosenYear: string,
    selectedCategory: string,
    region: string,
    all: {
        startDate: string,
        endDate: string,
        chosenYear: string,
        selectedCategory: string,
        region: string,
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
        case actionKinds.region: {
            return {
                ...state,
                region: value
            }
        }
        case actionKinds.all: {
            return {
                ...state,
                startDate: value,
                endDate: value,
                chosenYear: value,
                selectedCategory: value,
                region: value,
            }
        }
        default:
            return state;
    }
};

const transformData = (data: SalesData[]) => {

    const groupedData = data.reduce((accumulator, item) => {
        const year = new Date(item.date).getFullYear().toString();
        const region = item.region;

        if (!accumulator[year]) {
            accumulator[year] = {};
        }

        if (!accumulator[year][region]) {
            accumulator[year][region] = { sales: 0, expenses: 0, profit: 0 };
        }

        accumulator[year][region].sales += item.sales;
        accumulator[year][region].expenses += item.expenses;
        accumulator[year][region].profit += item.profit;

        return accumulator;
    }, {} as { [year: string]: { [region: string]: { sales: number, expenses: number, profit: number } } });

    return groupedData;
};

const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    aspectRatio: 2,
    plugins: {
        title: {
            display: false,
            text: 'Profit, Sales and Expenses by Year and Region',
        },
    },
    scales: {
        x: {
            title: {
                display: false,
                text: 'Year - Region',
            },
        },
        y: {
            title: {
                display: false,
                text: 'Amount',
            },
            beginAtZero: true,
            stacked: false,
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

const SalesProfitExpensesPerRegion: React.FC = () => {
    const [data, setData] = useState<SalesData[]>([]);
    const [filteredData, setFilteredData] = useState<SalesData[]>([]);

    const [state, dispatch] = useReducer(reducer, { startDate: '', endDate: '', chosenYear: '', selectedCategory: '', region: '', all: { startDate: '', endDate: '', chosenYear: '', selectedCategory: '', region: '' } });

    useEffect(() => {
        fetch('/SalesData.json')
            .then((response) => response.json())
            .then((data: SalesData[]) => {
                setData(data);
                setFilteredData(data);
            });
    }, []);

    const regions = ["North", "West", "East", "South"];
    const years = Array.from(new Set(data.map(item => new Date(item.date).getFullYear().toString()))).sort();

    const filterData = () => {
        const filtered = data.filter(entry => {
            const year = entry.date.substring(0, 4);
            const region = entry.region;
            return (!state.chosenYear || year === state.chosenYear) && (!state.region || region === state.region);
        });
        setFilteredData(filtered);
    };

    useEffect(() => {
        filterData();
    }, [state.chosenYear, state.region]);

    const transformedData = React.useMemo(() => transformData(filteredData), [filteredData]);

    const chartLabels = state.chosenYear ? regions.map(region => `${state.chosenYear} - ${region}`) : years.flatMap(year => regions.map(region => `${year} - ${region}`));

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Sales',
                data: state.chosenYear ? regions.map(region => transformedData[state.chosenYear]?.[region]?.sales) : years.flatMap(year => regions.map(region => transformedData[year]?.[region]?.sales)),
                backgroundColor: "#fe938c",
            },
            {
                label: 'Expenses',
                data: state.chosenYear ? regions.map(region => transformedData[state.chosenYear]?.[region]?.expenses) : years.flatMap(year => regions.map(region => transformedData[year]?.[region]?.expenses)),
                backgroundColor: '#7d92b8',
            },
            {
                label: 'Profit',
                data: state.chosenYear ? regions.map(region => transformedData[state.chosenYear]?.[region]?.profit) : years.flatMap(year => regions.map(region => transformedData[year]?.[region]?.profit)),
                backgroundColor: '#1b998b',
            },
        ],
    };

    const resetFilters = () => {
        dispatch({ type: actionKinds.all, value: "" });
    }

    return (
        <>
            <Typography sx={chartTitleSx}>Profit, Sales and Expenses by Region</Typography>
            <Box sx={{ marginTop: 3 }}>
                <FormControl sx={{ marginLeft: 3 }}>
                    <InputLabel id="demo-simple-select-label">Filter by year</InputLabel>
                    <Select
                        labelId="chosenYear"
                        id='full-width-text-field'
                        value={state.chosenYear}
                        label="Filter by year"
                        onChange={(e) => dispatch({ type: actionKinds.chosenYear, value: e.target.value })}
                        sx={{ width: 200 }}
                    >
                        {
                            Array.from(new Set(data.map(label => label.date.substring(0, 4)))).map((label: string) => <MenuItem value={label} key={label}>{label}</MenuItem>)
                        }
                    </Select>
                </FormControl>
                <FormControl sx={{ marginLeft: 3 }}>
                    <InputLabel id="demo-simple-select-label">Filter by region</InputLabel>
                    <Select
                        labelId="chosenYear"
                        id='full-width-text-field'
                        value={state.region}
                        label="Filter by year"
                        onChange={(e) => dispatch({ type: actionKinds.region, value: e.target.value })}
                        sx={{ width: 200 }}
                    >
                        {
                            Array.from(new Set(data.map(label => label.region))).map((label: string) => <MenuItem value={label} key={label}>{label}</MenuItem>)
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
            <Bar
                style={{ marginTop: '18px' }}
                data={chartData}
                options={chartOptions}
            />
        </>
    );
}

export default SalesProfitExpensesPerRegion;