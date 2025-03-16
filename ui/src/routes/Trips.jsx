import PageTemplate from "../components/PageTemplate"
import TripCard from "../components/TripCard"

function Trips() {
  return (
    <PageTemplate>
      <h1 className="text-3xl font-bold mb-4">My Trips</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TripCard
          image="https://i.pinimg.com/736x/1e/69/d6/1e69d69083d98c4ac2b37fcd3a21c978.jpg"
          days={7}
          people={2}
          destinations={3}
          name="Trip to Bali"
          date="June 2022"
        />
        <TripCard
          image="https://i.pinimg.com/736x/6b/f7/56/6bf756672824e2f961d661809649f0b7.jpg"
          days={10}
          people={4}
          destinations={5}
          name="Trip to Japan"
          date="July 2022"
        />
        <TripCard
          image="https://i.pinimg.com/736x/97/70/be/9770bee8dae261fbf16eaf952aa1e409.jpg"
          days={14}
          people={6}
          destinations={7}
          name="Trip to Europe"
          date="August 2022"
        />
      </div>


    </PageTemplate>
  )
}

export default Trips

