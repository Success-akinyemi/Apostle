import Button from "../Components/Button"
import CategoryList from "../Components/CategoryList"
import Navbar from "../Components/Navbar"
import SongList from "../Components/SongList"

function Dashboard({ setSelectedCard }) {
  return (
    <div className="flex flex-col">
      <Navbar />
    
        <div className="flex flex-col pad2 mt-[70px]">
            {/**BTN */}
            <div className="ml-auto mt-[10px] flex items-center gap-3">
                <div className="flex">
                    <Button onClick={() => setSelectedCard('song')} text={'New Song'} />
                </div>
                <div className="flex">
                    <Button onClick={() => setSelectedCard('category')} text={'New Category'} />
                </div>
            </div>
            
            {/**BODY */}
            <div className="flex mt-12 items-center gap-12 justify-between">
                <div className="flex flex-7 w-full">
                    <SongList />
                </div>

                <div className="flex flex-3 w-full">
                    <CategoryList />
                </div>
            </div>
        </div>
    </div>
  )
}

export default Dashboard
