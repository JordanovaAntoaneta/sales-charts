import React, { useEffect, useReducer, useState } from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
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

const transformData = (filteredData: SalesData[]) => {
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

    const groupedData = filteredData.reduce((accumulator, entry) => {
        const year = new Date(entry.date).getFullYear().toString();
        const month = (new Date(entry.date).getMonth() + 1).toString().padStart(2, '0');

        if (!accumulator[year]) {
            accumulator[year] = {};
        }

        if (!accumulator[year][month]) {
            accumulator[year][month] = {};
            categories.forEach(category => accumulator[year][month][category] = 0);
        }

        if (!labels.includes(`${year}-${month}`)) {
            labels.push(`${year}-${month}`);
        }

        if (categories.includes(entry.product_category)) {
            accumulator[year][month][entry.product_category] += entry.sales;
        }

        return accumulator;
    }, {} as { [year: string]: { [month: string]: { [category: string]: number } } });

    return { groupedData, categories, labels };
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

const StackedBarChart: React.FC = () => {
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
            return (!state.startDate || year >= state.startDate) &&
                (!state.endDate || year <= state.endDate) &&
                (!state.selectedCategory || entry.product_category === state.selectedCategory) &&
                (!state.chosenYear || year === state.chosenYear);
        });
        setFilteredData(filtered);
    };

    useEffect(() => {
        filterData();
    }, [state.selectedCategory, state.startDate, state.endDate, state.chosenYear]);

    const { groupedData, categories, labels } = React.useMemo(() => transformData(filteredData), [filteredData]);

    const chartData = {
        labels: labels,
        datasets: categories.map((category, index) => ({
            label: category,
            data: labels.map(label => {
                const [year, month] = label.split("-");
                return groupedData[year][month][category];
            }),
            backgroundColor: [
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

    const resetFilters = () => {
        dispatch({ type: actionKinds.all, value: "" });
    }

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx}>Monthly Sales by Product Category</Typography>
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
                            Array.from(new Set(data.map(label => label.date.split("-")[0]))).map((label: string) => <MenuItem value={label} key={label}>{label}</MenuItem>)
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

            <Bar
                style={{ marginTop: '30px' }}
                data={chartData}
                options={{
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: false,
                                text: 'Year-Month',
                            },
                            stacked: true,
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Number of sales',
                            },
                            stacked: true,
                            beginAtZero: true
                        },
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    console.log(context)
                                    const dateParts = context.label.split("-");
                                    //const year = dateParts[0];
                                    //const month = dateParts[1];
                                    const category = context.dataset.label;
                                    const sales = context.raw;
                                    //const totalSales = totalSalesByYear[year].total;
                                    let tooltipLines = [`${category}: ${sales}`];
                                    tooltipLines.push(' ');
                                    tooltipLines.push('Total yearly sales per categories:');
                                    const segments = data.filter(entry =>
                                        entry.product_category === category &&
                                        entry.date.substring(0, 7) === context.label
                                    );
                                    // segments.forEach(segment => {
                                    //     tooltipLines.push(`- ${segment.marketing_channel}: ${segment.sales}`);
                                    // })

                                    //[{online: 123}, {online: 423423}, {online: 12312}]

                                    // {online: prev + new}
                                    const totalSalesByCat = segments.reduce((prev, current) => {

                                        if (Object.keys(prev).includes(current.marketing_channel)) {
                                            return {
                                                ...prev,
                                                [current.marketing_channel]: prev[current.marketing_channel] + current.sales
                                            }
                                        }
                                        return {
                                            ...prev,
                                            [current.marketing_channel]: + current.sales
                                        }
                                    }, Object.create(null))

                                    tooltipLines = [
                                        ...tooltipLines,
                                        ...Object.entries(totalSalesByCat).map(([key, value], _index) => {
                                            return `- ${key}: ${value}`
                                        })
                                    ]
                                    const total = segments.reduce((prev, current) => {
                                        return prev + current.sales
                                    }, 0);

                                    tooltipLines.push(' ');
                                    tooltipLines.push(`Total sales for ${context.label}: ${total}`);
                                    return tooltipLines;
                                }
                            }
                        },
                    },
                }}
            />
        </>
    );
};

export default StackedBarChart;