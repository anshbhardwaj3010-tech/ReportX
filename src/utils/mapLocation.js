export const getIssueCoordinates = (issue) => {
  const latitude = Array.isArray(issue?.coords) ? issue.coords[0] : issue?.latitude;
  const longitude = Array.isArray(issue?.coords) ? issue.coords[1] : issue?.longitude;
  if (latitude == null || longitude == null) return null;

  const coordinates = [Number(latitude), Number(longitude)];
  if (!coordinates.every(Number.isFinite)
    || coordinates[0] < -90 || coordinates[0] > 90
    || coordinates[1] < -180 || coordinates[1] > 180) return null;

  return coordinates;
};

export const getDirectionsUrl = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;
  const [latitude, longitude] = coordinates;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
    || latitude < -90 || latitude > 90
    || longitude < -180 || longitude > 180) return null;

  const query = new URLSearchParams({
    api: '1',
    destination: `${latitude},${longitude}`
  });
  return `https://www.google.com/maps/dir/?${query.toString()}`;
};
