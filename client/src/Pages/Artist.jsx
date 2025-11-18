import { useNavigate } from "react-router-dom";
import Button from "../Components/Button"
import CategoryList from "../Components/CategoryList"
import Navbar from "../Components/Navbar"
import { useFetchMyArtist } from "../Helpers/fetch";
import ArtistList from "../Components/ArtistList";

function Artist({ setSelectedCard, setCategoryId, setArtistId }) {
    const navigate = useNavigate()
    const { isFetching: fetchingArtist, data: artistData } = useFetchMyArtist();
    const cat = artistData?.data;
    const handleHome = () => {
        navigate('/dashboard')
    }

    return (
    <div className="flex flex-col">
      <Navbar />
    
        <div className="flex flex-col pad2 mt-[70px]">
            {/**BTN */}
            <div className="ml-auto mt-[10px] flex items-center gap-3 flex-wrap">
            <div className="flex">
                    <Button onClick={handleHome} text={'Dashboard'} style={`!phone:text-[9px]`} />
                </div>
                <div className="flex">
                    <Button onClick={() => setSelectedCard('artist')} text={'New Artist'}  style={`whitespace-nowrap`}/>
                </div>
            </div>
            
            {/**BODY */}
            <div className="flex mt-12 items-center gap-12 justify-between">

                <div className="flex flex-[3] w-full mb-8">
                    <ArtistList data={cat} loading={fetchingArtist} setSelectedCard={setSelectedCard} setArtistId={setArtistId} style={`!min-h-[100vh]`} cardStyle={`!min-h-[100vh]`} />
                </div>
            </div>
        </div>
    </div>
  )
}

export default Artist
