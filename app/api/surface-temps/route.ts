import { NextResponse } from "next/server";


type Point = { lat: number, lon: number};
type TempResult = Point & { temperatureC: number | null };

//to limit the amount of time we are calling the api
const BATCH_SIZE = 5;
const DELAY_MS = 600;

//helper function to delay the api call since we are reaching limit
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchTemperature(p: Point): Promise<TempResult>{
    try{
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m&timezone=auto`;

        const res = await fetch(openMeteoUrl, { cache: "no-store" });

        if(!res.ok){
            console.warn(`Bad Response at ${p.lat}, ${p.lon}: ${res.status} * ${res.statusText}`)
            return { lat: p.lat, lon: p.lon, temperatureC: null }
        }

        const json = await res.json();
        const temp = json?.current?.temperature_2m ?? null;

        return { lat: p.lat, lon: p.lon, temperatureC: typeof temp === "number" ? temp : null }
    }catch(error){
         console.error(`Error fetching data for ${p.lat}, ${p.lon}:`, error);
         return { lat: p.lat, lon: p.lon, temperatureC: null }
    }
}

export async function POST(request: Request){
    try{
        //this makes sure we always have something in the body
        //body should contain an array of points [{ lat: number, lon: number}, ...]
        const body = await request.json().catch(() => ({}));
        //if the body does not contain any points then we just set points to an empty array
        const points: Point[] = Array.isArray(body?.points) ? body.points : [];

        //get out early if no points are provided 
        if (points.length === 0) {
            return NextResponse.json({ success: false, message: "No Points Provided." });
        }

        const results: TempResult[] = [];
        const totalPoints = points.length;

        for(let i = 0; i < totalPoints; i += BATCH_SIZE){
            const batch = points.slice(i, i + BATCH_SIZE);

            const batchPromises = batch.map(fetchTemperature);
            const batchResults = await Promise.all(batchPromises);

            results.push(...batchResults);

            const isLastBatch = i + BATCH_SIZE >= totalPoints;

            if(!isLastBatch){
                console.log(`Pausing for ${DELAY_MS}ms after processing batch ${Math.ceil((i + 1) / BATCH_SIZE)} of ${Math.ceil(totalPoints / BATCH_SIZE)}`);
                await delay(DELAY_MS);
            }
        }
        return NextResponse.json({ success: true, count: results.length, results });
    } catch(error){
        console.error("Error while processing request:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}