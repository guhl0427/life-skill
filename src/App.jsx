import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import ScrollManager from "./components/ScrollManager"
import Home from "./pages/Home"
import NewTip from "./pages/NewTip"
import EditTip from "./pages/EditTip"
import TipDetail from "./pages/TipDetail"
import Categories from "./pages/Categories"
import Tags from "./pages/Tags"
import Stats from "./pages/Stats"
import Trash from "./pages/Trash"
import Settings from "./pages/Settings"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Layout>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tips/new" element={<NewTip />} />
        <Route path="/tips/:id" element={<TipDetail />} />
        <Route path="/tips/:id/edit" element={<EditTip />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
