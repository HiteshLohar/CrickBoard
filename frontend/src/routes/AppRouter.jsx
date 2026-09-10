import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AppLayout from '../layouts/AppLayout'
import Dashboard from '../pages/dashboard/Dashboard'
import Players from '../pages/players/Players'
import Teams from '../pages/teams/Teams'
import Matches from '../pages/matches/Matches'
import CreateMatch from '../pages/matches/CreateMatch'
import MatchSetup from '../pages/matches/MatchSetup'
import LiveMatch from '../pages/matches/LiveMatch'
import MatchScorecard from '../pages/matches/MatchScorecard'
import PublicMatch from '../pages/public/PublicMatch'

function Placeholder({ title }) {
    return (
        <main>
            <h1>{title}</h1>
        </main>
    )
}

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/matches/public/:publicId" element={<PublicMatch />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>


                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route path="/matches" element={<Matches />} />

                        <Route path="/matches/create" element={<CreateMatch />} />

                        <Route path="/matches/:matchId/setup" element={<MatchSetup />} />

                        <Route path="/matches/:matchId/live" element={<LiveMatch />} />

                        <Route path="/matches/:matchId/scorecard" element={<MatchScorecard />} />

                        <Route path="/teams" element={<Teams />} />

                        <Route path="/players" element={<Players />} />
                    </Route>
                </Route>

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter