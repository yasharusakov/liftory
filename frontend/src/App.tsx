import {Route, Routes} from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Home from './pages/Home'
import History from './pages/History'
import Progress from './pages/Progress'
import Records from './pages/Records'

const App = () => {
    return (
        <Routes>
            <Route element={<AppLayout/>}>
                <Route path="/" element={<Home/>}/>
                <Route path="/history" element={<History/>}/>
                <Route path="/records" element={<Records/>}/>
                <Route path="/progress" element={<Progress/>}/>
            </Route>
        </Routes>
    )
}

export default App
