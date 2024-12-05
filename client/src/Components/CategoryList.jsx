import { useFetchCategories } from "../Helpers/fetch"
import Spinner from "./Spinner"

function CategoryList() {
    const { isFetching: fetchingCategories, data: categoriesData } = useFetchCategories()
    
    console.log('object', categoriesData?.data)

  return (
    <div className="w-full rounded-[8px] overflow-hidden overflow-y-auto max-h-[30vh] border-[3px] border-primary-color">
      <div className="flex w-full p-3 bg-primary-color">
        <h2 className="h2 text-white">Categories</h2>
      </div>

      <div className="p-3">
        {
            fetchingCategories ? (
                <div className="flex items-center justify-center mt-2 mb-4">
                    <Spinner style={`!text-[40px]`} />
                </div>
            ) : (
                <div className="">
                    feui
                </div>
            )
        }
      </div>
    </div>
  )
}

export default CategoryList
