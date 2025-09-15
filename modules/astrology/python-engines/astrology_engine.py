#!/usr/bin/env python3
"""
Astrological calculations using Immanuel library with Swiss Ephemeris
"""

import json
import sys
from datetime import datetime
from immanuel import charts
from immanuel.classes.serialize import ToJSON


def calculate_chart(date_str, time_str, latitude, longitude):
    """
    Calculate comprehensive astrological chart using Immanuel library with Swiss Ephemeris
    
    Args:
        date_str: Date in YYYY-MM-DD format
        time_str: Time in HH:MM format  
        latitude: Latitude as string or float
        longitude: Longitude as string or float
    
    Returns:
        Dict with comprehensive chart data including houses, aspects, element balance, etc.
    """
    try:
        # Parse date and time
        date_obj = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        
        # Create subject
        native = charts.Subject(
            date_time=date_obj,
            latitude=latitude,
            longitude=longitude
        )
        
        # Generate natal chart
        natal = charts.Natal(native)
        
        # Extract key astrological data
        chart_data = {
            "bigThree": {
                "sunSign": None,
                "moonSign": None, 
                "risingSign": None
            },
            "lunarNodes": {
                "northNode": None,
                "southNode": None
            },
            "planets": {},
            "houses": {},
            "aspects": [],
            "chartInfo": {
                "date": date_str,
                "time": time_str,
                "location": f"{latitude}, {longitude}"
            }
        }
        
        # Extract planetary positions
        for obj_key, obj in natal.objects.items():
            planet_name = obj.name
            sign_name = obj.sign.name
            house_number = obj.house.number if obj.house else None
            degree = obj.sign_longitude.degrees
            minute = obj.sign_longitude.minutes
            
            # Store planet data
            chart_data["planets"][planet_name] = {
                "sign": sign_name,
                "house": house_number,
                "degree": degree,
                "minute": minute,
                "formatted": f"{degree}°{minute:02d}' {sign_name}",
                "retrograde": hasattr(obj, 'movement') and hasattr(obj.movement, 'retrograde') and obj.movement.retrograde
            }
            
            # Extract Big Three
            if planet_name == "Sun":
                chart_data["bigThree"]["sunSign"] = sign_name
            elif planet_name == "Moon":
                chart_data["bigThree"]["moonSign"] = sign_name
            elif planet_name == "Ascendant":
                chart_data["bigThree"]["risingSign"] = sign_name
        
        # Extract Lunar Nodes
        if "True North Node" in chart_data["planets"]:
            chart_data["lunarNodes"]["northNode"] = chart_data["planets"]["True North Node"]["sign"]
        if "True South Node" in chart_data["planets"]:
            chart_data["lunarNodes"]["southNode"] = chart_data["planets"]["True South Node"]["sign"]
        
        # Extract house information  
        for house_key, house in natal.houses.items():
            chart_data["houses"][house.number] = {
                "sign": house.sign.name,
                "degree": house.longitude.degrees,
                "minute": house.longitude.minutes
            }
        
        # If we have houses but no Ascendant in objects, get it from 1st house
        if not chart_data["bigThree"]["risingSign"] and 1 in chart_data["houses"]:
            chart_data["bigThree"]["risingSign"] = chart_data["houses"][1]["sign"]
        
        # Extract aspects (safely handle missing aspects)
        if hasattr(natal, 'aspects') and natal.aspects:
            for aspect in natal.aspects:
                try:
                    if hasattr(aspect, 'active') and hasattr(aspect, 'passive') and hasattr(aspect, 'aspect'):
                        orb_value = float(aspect.orb) if hasattr(aspect, 'orb') else 0
                        chart_data["aspects"].append({
                            "planet1": aspect.active.name,
                            "planet2": aspect.passive.name,
                            "aspect": aspect.aspect.name,
                            "orb": orb_value,
                            "applying": aspect.applying if hasattr(aspect, 'applying') else False,
                            "strength": "strong" if orb_value <= 2 else "moderate" if orb_value <= 4 else "weak"
                        })
                except Exception as e:
                    # Skip malformed aspects
                    continue
        
        # Calculate element balance
        element_counts = {"fire": 0, "earth": 0, "air": 0, "water": 0}
        modality_counts = {"cardinal": 0, "fixed": 0, "mutable": 0}
        
        element_map = {
            'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
            'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth', 
            'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
            'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water'
        }
        
        modality_map = {
            'Aries': 'cardinal', 'Cancer': 'cardinal', 'Libra': 'cardinal', 'Capricorn': 'cardinal',
            'Taurus': 'fixed', 'Leo': 'fixed', 'Scorpio': 'fixed', 'Aquarius': 'fixed',
            'Gemini': 'mutable', 'Virgo': 'mutable', 'Sagittarius': 'mutable', 'Pisces': 'mutable'
        }
        
        for planet_data in chart_data["planets"].values():
            sign = planet_data["sign"]
            if sign in element_map:
                element_counts[element_map[sign]] += 1
            if sign in modality_map:
                modality_counts[modality_map[sign]] += 1
        
        chart_data["elementBalance"] = element_counts
        chart_data["modalityBalance"] = modality_counts
        
        # Determine dominant planet (simplified)
        planet_scores = {}
        for aspect in chart_data["aspects"]:
            score = 3 if aspect["strength"] == "strong" else 2 if aspect["strength"] == "moderate" else 1
            planet_scores[aspect["planet1"]] = planet_scores.get(aspect["planet1"], 0) + score
            planet_scores[aspect["planet2"]] = planet_scores.get(aspect["planet2"], 0) + score
        
        if planet_scores:
            chart_data["dominantPlanet"] = max(planet_scores.keys(), key=lambda k: planet_scores[k])
        else:
            chart_data["dominantPlanet"] = "Sun"
        
        # Generate life themes based on signs
        themes = []
        sun_themes = {
            'Aries': ['Leadership', 'Initiative', 'Independence'],
            'Taurus': ['Stability', 'Sensuality', 'Persistence'], 
            'Gemini': ['Communication', 'Adaptability', 'Learning'],
            'Cancer': ['Nurturing', 'Emotional depth', 'Protection'],
            'Leo': ['Creativity', 'Self-expression', 'Recognition'],
            'Virgo': ['Service', 'Perfectionism', 'Analysis'],
            'Libra': ['Balance', 'Relationships', 'Harmony'],
            'Scorpio': ['Transformation', 'Intensity', 'Depth'],
            'Sagittarius': ['Philosophy', 'Adventure', 'Growth'],
            'Capricorn': ['Achievement', 'Structure', 'Authority'],
            'Aquarius': ['Innovation', 'Humanitarianism', 'Independence'],
            'Pisces': ['Spirituality', 'Compassion', 'Intuition']
        }
        
        if chart_data["bigThree"]["sunSign"] in sun_themes:
            themes.extend(sun_themes[chart_data["bigThree"]["sunSign"]])
        
        chart_data["lifeThemes"] = themes[:8]  # Limit to 8 themes
        
        return chart_data
        
    except Exception as e:
        return {"error": str(e)}


def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) != 5:
        print(json.dumps({"error": "Usage: python astrology_engine.py <date> <time> <latitude> <longitude>"}))
        sys.exit(1)
    
    date_str = sys.argv[1]
    time_str = sys.argv[2] 
    latitude = sys.argv[3]
    longitude = sys.argv[4]
    
    try:
        result = calculate_chart(date_str, time_str, latitude, longitude)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": f"Chart calculation failed: {str(e)}"}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()