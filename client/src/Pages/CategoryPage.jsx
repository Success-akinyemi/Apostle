import { useNavigate } from "react-router-dom";
import Button from "../Components/Button"
import CategoryList from "../Components/CategoryList"
import Navbar from "../Components/Navbar"
import { useFetchCategories } from "../Helpers/fetch";

function CategoryPage({ setSelectedCard, setCategoryId, setSongId }) {
    const navigate = useNavigate()
    const { isFetching: fetchingCategories, data: categoriesData } = useFetchCategories();
    const cat = categoriesData?.data;
    const handleHome = () => {
        navigate('/dashboard')
    }

    return (
    <div className="flex flex-col">
      <Navbar />
    
        <div className="flex flex-col pad2 mt-[70px]">
            {/**BTN */}
            <div className="ml-auto mt-[10px] flex items-center gap-3">
            <div className="flex">
                    <Button onClick={handleHome} text={'Dashboard'} style={`!phone:text-[9px]`} />
                </div>
                <div className="flex">
                    <Button onClick={() => setSelectedCard('category')} text={'New Category'} />
                </div>
            </div>
            
            {/**BODY */}
            <div className="flex mt-12 items-center gap-12 justify-between">

                <div className="flex flex-[3] w-full mb-8">
                    <CategoryList data={cat} loading={fetchingCategories} setSelectedCard={setSelectedCard} setCategoryId={setCategoryId} style={`!min-h-[100vh]`} cardStyle={`!min-h-[100vh]`} />
                </div>
            </div>
        </div>
    </div>
  )
}

export default CategoryPage
