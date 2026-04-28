import './App.css';
import { PatientProvider } from './context/PatientContext';
import Header from '/components/header/header.jsx';
import Footer from '/components/footer/footer.jsx';
import Calendar from '/components/calendar/calendar.jsx';

function App() {
  return (
    <PatientProvider>
      <Header />
      <Calendar />
      <Footer />
    </PatientProvider>
  )
};

export default App
