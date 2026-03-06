export async function fetch311Requests(lat: number, lon: number, radius: number) {
  const response = await fetch(`http://127.0.0.1:8000/requests311?lat=${lat}&lon=${lon}&radius=${radius}`);
  const data = await response.json();
  return data.requests || [];
}