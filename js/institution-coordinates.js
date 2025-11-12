// Institution coordinates for mapping
const institutionCoordinates = {
    // Ilocos Norte - Universities & Colleges
    'Mariano Marcos State University': { lat: 18.0608, lng: 120.5488 },
    'Northwestern University': { lat: 18.1856, lng: 120.5669 },
    'Divine Word College of Laoag': { lat: 18.2042, lng: 120.6006 },
    'Data Center College of the Philippines - Laoag': { lat: 18.1978, lng: 120.5957 },
    'Ilocos Norte College of Arts and Trades': { lat: 18.2039, lng: 120.5927 },
    'AMA Computer University - Laoag': { lat: 18.1956, lng: 120.5951 },
    
    // Ilocos Norte - High Schools
    'Ilocos Norte National High School': { lat: 18.2045, lng: 120.5912 },
    'Laoag City National Science High School': { lat: 18.1978, lng: 120.5957 },
    'Mariano Marcos State University Laboratory High School': { lat: 18.0608, lng: 120.5488 },
    'Ilocos Norte College of Arts and Trades High School': { lat: 18.2039, lng: 120.5927 },
    
    // Ilocos Sur - Universities & Colleges
    'University of Northern Philippines': { lat: 17.5670, lng: 120.3830 },
    'Ilocos Sur Polytechnic State College': { lat: 17.3656, lng: 120.4764 },
    'St. Paul College of Ilocos Sur': { lat: 17.5803, lng: 120.3858 },
    'Data Center College of the Philippines - Vigan': { lat: 17.5700, lng: 120.3860 },
    'AMA Computer University - Vigan': { lat: 17.5742, lng: 120.3865 },
    
    // Ilocos Sur - High Schools
    'Ilocos Sur National High School': { lat: 17.5700, lng: 120.3860 },
    'UNP Laboratory High School': { lat: 17.5670, lng: 120.3830 },
    'Saint Paul College of Ilocos Sur High School': { lat: 17.5803, lng: 120.3858 },
    'Tagudin National High School': { lat: 16.9333, lng: 120.4500 },
    
    // Cagayan - Universities & Colleges
    'Cagayan State University': { lat: 17.6156, lng: 121.7269 },
    'University of Cagayan Valley': { lat: 17.6331, lng: 121.8147 },
    'St. Paul University Philippines': { lat: 17.6172, lng: 121.7233 },
    'AMA Computer University - Tuguegarao': { lat: 17.6150, lng: 121.7260 },
    'International School of Asia and the Pacific': { lat: 17.6429, lng: 121.7612 },
    
    // Cagayan - High Schools
    'Cagayan National High School': { lat: 17.6189, lng: 121.7226 },
    'Tuguegarao City Science High School': { lat: 17.6136, lng: 121.7250 },
    'St. Paul University High School': { lat: 17.6172, lng: 121.7233 },
    'CSU Laboratory High School': { lat: 17.6590, lng: 121.7532 },
    
    // Metro Manila - Universities & Colleges
    'University of the Philippines': { lat: 14.6549, lng: 121.0649 },
    'Ateneo de Manila University': { lat: 14.6370, lng: 121.0780 },
    'De La Salle University': { lat: 14.5586, lng: 120.9896 },
    'University of Santo Tomas': { lat: 14.6090, lng: 120.9890 },
    'Mapúa University': { lat: 14.5907, lng: 120.9779 },
    'Far Eastern University': { lat: 14.6038, lng: 120.9855 },
    'Polytechnic University of the Philippines': { lat: 14.5920, lng: 121.0067 },
    'Pamantasan ng Lungsod ng Maynila': { lat: 14.5870, lng: 120.9760 },
    'Manila Central University': { lat: 14.6592, lng: 120.9862 },
    
    // Metro Manila - High Schools
    'Philippine Science High School': { lat: 14.6549, lng: 121.0649 },
    'Manila Science High School': { lat: 14.5806, lng: 120.9862 },
    'Quezon City Science High School': { lat: 14.6585, lng: 121.0305 },
    'Ateneo High School': { lat: 14.6370, lng: 121.0780 },
    'La Salle Green Hills': { lat: 14.5915, lng: 121.0532 }
};

// Helper function to get coordinates for an institution
function getInstitutionCoordinates(institutionName) {
    return institutionCoordinates[institutionName] || null;
}
