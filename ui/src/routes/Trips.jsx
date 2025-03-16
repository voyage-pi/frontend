import PageTemplate from "../components/PageTemplate"
import TripCard from "../components/TripCard"
import userData from "../../public/user.json"

function Trips() {
  return (
    <PageTemplate>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userData.trips.map((trip) => (
          <TripCard
            key={trip.id}
            image={trip.image}
            days={trip.days}
            people={trip.people}
            destinations={trip.destinations}
            name={trip.name}
            date={trip.date}
          />
        ))}
      </div>
    </PageTemplate>
  )
}

export default Trips