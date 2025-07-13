"use client"
import SightingsMapTimeline from "@/components/livingPlanetIndex/SightingsMapTimeline";
import PopulationTrendAreaChart from "@/components/livingPlanetIndex/populationTrend/PopulationTrendAreaChart";

export default function Home() {

  return (
    <div className="MainDiv" style={{width: "100vw", height: "100vh"}}>
      <PopulationTrendAreaChart />
    </div>
  );
}
