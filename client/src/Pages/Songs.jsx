import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import Navbar from "../Components/Navbar";
import SongList from "../Components/SongList";
import { useFetchSongs } from "../Helpers/fetch";

function Songs({ setSelectedCard, setCategoryId, setSongId }) {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const limit = 15;
    const { data: songsData, isFetching: fetchingSongs } = useFetchSongs({page, limit});
    const data = songsData?.data;
    const totalPages = songsData?.totalPages || 0;

    const handleHome = () => {
        navigate("/dashboard");
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage((prev) => prev + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage((prev) => prev - 1);
    };

    return (
        <div className="flex flex-col">
            <Navbar />

            <div className="flex flex-col pad2 mt-[70px]">
                {/** Buttons */}
                <div className="ml-auto mt-[10px] flex items-center gap-3">
                    <div className="flex">
                        <Button onClick={handleHome} text={"Dashboard"} style={`!phone:text-[9px]`} />
                    </div>
                    <div className="flex">
                        <Button
                            onClick={() => setSelectedCard("song")}
                            text={"New Song"}
                            style={`!phone:text-[9px]`}
                        />
                    </div>
                </div>

                {/** Song List */}
                <div className="flex mt-12 items-center gap-12 justify-between">
                    <div className="flex flex-[7] w-full mb-8">
                        <SongList
                            data={data}
                            loading={fetchingSongs}
                            setSongId={setSongId}
                            setSelectedCard={setSelectedCard}
                        />
                    </div>
                </div>

                {/** Pagination */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={handlePrevPage}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Songs;
