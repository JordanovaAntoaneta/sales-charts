import './App.css';
import { Chart, CategoryScale } from 'chart.js/auto';
import ProfitPerCategoryChart from './components/ProfitPerCategoryChart';
import Paper from '@mui/material/Paper';
import ProfitPerCategoryChartBar from './components/ProfitPerCategoryChartBar';
import ScatterSalesExpenses from './components/ScatterSalesExpenses';
import ScatterEmployeeProfit from './components/ScatterEmployeesProfit';
import LineProfitSalesExpensesChart from './components/SalesProfitExpensesPerYear';
import SalesProfitExpensesPerRegion from './components/SalesProfitExpensesPerRegion';
import StackedBarChart from './components/StackedBarChart';
import EverythingThroughTheYears from './components/EverythingThroughTheYears';

Chart.register(CategoryScale);

function App() {

  return (
    <div className="App" >
      <div style={{ height: 60 }}></div>
      <Paper
        elevation={10}
        square={false}
        sx={{
          padding: "20px",
          margin: "auto",
          borderRadius: "16px",
          width: "900px",
          height: "720px",
          marginBottom: "0",
        }}>
        <ProfitPerCategoryChart />
      </Paper>
      <Paper
        elevation={10}
        square={false}
        sx={{
          padding: "20px",
          margin: "auto",
          marginTop: "20px",
          borderRadius: "16px",
          width: "900px",
          height: "720px",
          marginBottom: "0",
        }}>
        <ProfitPerCategoryChartBar />
      </Paper>
      <Paper
        elevation={10}
        square={false}
        sx={{
          padding: "20px",
          margin: "auto",
          marginTop: "20px",
          borderRadius: "16px",
          width: "900px",
          height: "580px",
          marginBottom: "0",
        }}>
        <ScatterSalesExpenses />
      </Paper>
      <Paper
        elevation={10}
        square={false}
        sx={{
          padding: "20px",
          margin: "auto",
          marginTop: "20px",
          borderRadius: "16px",
          width: "900px",
          height: "580px",
          marginBottom: "0",
        }}>
        <ScatterEmployeeProfit />
      </Paper>
      <Paper
        elevation={10}
        square={false}
        sx={{
          padding: "20px",
          margin: "auto",
          marginTop: "20px",
          borderRadius: "16px",
          width: "900px",
          height: "640px",
          marginBottom: "0",
        }}>
        <LineProfitSalesExpensesChart />
      </Paper>
      <Paper
        elevation={10}
        square={false}
        sx={{
          padding: "20px",
          margin: "auto",
          marginTop: "20px",
          borderRadius: "16px",
          width: "900px",
          height: "620px",
          marginBottom: "0",
        }}>
        <SalesProfitExpensesPerRegion />
      </Paper>
      <Paper
        elevation={10}
        square={false}
        sx={{
          padding: "20px",
          margin: "auto",
          marginTop: "20px",
          borderRadius: "16px",
          width: "900px",
          height: "720px",
          marginBottom: "0",
        }}>
        <StackedBarChart />
      </Paper>
      <Paper
        elevation={10}
        square={false}
        sx={{
          padding: "20px",
          margin: "auto",
          marginTop: "20px",
          borderRadius: "16px",
          width: "900px",
          height: "640px",
          marginBottom: "0",
        }}>
        <EverythingThroughTheYears />
      </Paper>
      <div style={{ height: 60 }}></div>
    </div >
  );
}

export default App;
