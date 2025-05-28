document.addEventListener('DOMContentLoaded', function() {
    // Geting match ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('matchId');
    
    const matches = {
        '1': {
            // Real Madrid vs Barcelona
            image: "/img/match.jpg",
            title: "Real Madrid Leyendas vs Barça Legends | Football Match",
            sport: "Football",
            date: "June 15 | 20:45",
            venue: "Santiago Bernabéu, Madrid",
            price: "€45",
            description: "The world stops when FC Barcelona and Real Madrid face off in El Clásico, the most intense and historic rivalry in football. Two giants of the game, both hungry for victory, step onto the pitch with one goal in mind—dominance. Barça, known for their fluid passing and attacking flair, will look to break down Madrid's rock-solid defense and counterattacking strength. With star players on both sides, the stakes couldn't be higher. Every pass, tackle, and goal will send shockwaves through millions of fans worldwide. Will Barça's magic shine at the Camp Nou, or will Real Madrid's determination steal the show? One thing is certain—this will be a battle for the ages!",
            duration: "1.5 Hours",
            competition: "Legends Exhibition Match",
            venueType: "Outdoor",
            arrangement: "Seated",
            kidFriendly: "Yes",
            petFriendly: "No",
            venueName: "Santiago Bernabéu",
            venueAddress: "Av. de Concha Espina, 1, 28036 Madrid, Spain",
            venueFeatures: ["Parking Available", "Wheelchair Access", "Food Courts"],
            mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3036.00459019971!2d-3.690522684603413!3d40.45303897936196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd4228e23705d39f%3A0xa8fff6d26e2b1988!2sSantiago%20Bernab%C3%A9u%20Stadium!5e0!3m2!1sen!2ses!4v1620000000000!5m2!1sen!2ses",
            directionsLink: "https://maps.google.com?q=Santiago+Bernabéu,Av.+de+Concha+Espina,+1,+28036+Madrid,+Spain"
        },
        '2': {
            // Manchester United vs Liverpool
            image: "/img/Big_Match_Liverpool_vs_Man_United.png",
            title: "Manchester United vs Liverpool FC | Premier League",
            sport: "Football",
            date: "June 22 | 16:30",
            venue: "Old Trafford, Manchester",
            price: "£65",
            description: "When Manchester United and Liverpool meet, English football stands still. This is more than a derby - it's a collision of cultures, a battle between England's most decorated clubs where every challenge carries generations of rivalry. United's attacking heritage faces Liverpool's gegenpressing machine in a contest that often decides seasons. The Theatre of Dreams transforms into a warzone when these titans clash, where moments of individual brilliance meet unrelenting team spirit. Will United's counter-attacks pierce Liverpool's high line, or will the Reds' relentless intensity overwhelm their arch-rivals? In this fixture, form means nothing - only passion, pride and legendary status matter.",
            duration: "1.5 Hours",
            competition: "Premier League",
            venueType: "Outdoor",
            arrangement: "Seated",
            kidFriendly: "Yes",
            petFriendly: "No",
            venueName: "Old Trafford",
            venueAddress: "Sir Matt Busby Way, Stretford, Manchester M16 0RA, UK",
            venueFeatures: ["Parking Available", "Wheelchair Access", "Multiple Food Options"],
            mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2379.786061302789!2d-2.291906684227845!3d53.46318367999875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487bae72e6c1f98f%3A0x2a0a3a7e22a3b3e5!2sOld%20Trafford!5e0!3m2!1sen!2suk!4v1620000000000!5m2!1sen!2suk",
            directionsLink: "https://maps.google.com?q=Old+Trafford,Sir+Matt+Busby+Way,+Stretford,+Manchester+M16+0RA,+UK"
        }
    };
    
    // Update page content based on match ID
    if (matchId && matches[matchId]) {
        const match = matches[matchId];
        
        // Ticket Section
        
        document.querySelector('.fixed-header h1').textContent = match.title;
        document.querySelector('.fixed-header p').textContent = match.date;
        
        
    }
});