#!/usr/bin/env python3
"""
Birth Chart SVG Generator using Kerykeion
Generates professional astrological charts with Swiss Ephemeris accuracy
"""

import sys
import json
import os
import tempfile
from datetime import datetime
from kerykeion import AstrologicalSubject, KerykeionChartSVG

def generate_birth_chart_svg(date_str, time_str, latitude, longitude, name="Birth Chart", location="", output_path=None):
    """
    Generate a professional birth chart SVG using Kerykeion
    
    Args:
        date_str: Date in YYYY-MM-DD format
        time_str: Time in HH:MM format  
        latitude: Latitude as string or float
        longitude: Longitude as string or float
        name: Chart title/name
        output_path: Optional path to save SVG file
    
    Returns:
        Dict with SVG content and metadata
    """
    try:
        # Parse date and time
        date_obj = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        
        # Create astrological subject with timezone handling
        # Determine timezone based on location
        timezone = "UTC"
        if location:
            if "Ottawa" in location or "Canada" in location:
                timezone = "America/Toronto"
            elif "New York" in location or "Eastern" in location:
                timezone = "America/New_York"
            elif "Los Angeles" in location or "Pacific" in location:
                timezone = "America/Los_Angeles"
            # Add more timezone mappings as needed
        
        # Use a generic location for chart calculation, but name will show user's name
        city = "Location"
        nation = "Earth"
        
        subject = AstrologicalSubject(
            name=name,  # This will now show the user's name instead of location
            year=date_obj.year,
            month=date_obj.month,
            day=date_obj.day,
            hour=date_obj.hour,
            minute=date_obj.minute,
            city=city,
            nation=nation,
            lat=float(latitude),
            lng=float(longitude),
            tz_str=timezone
        )
        
        # Create temp directory if needed
        temp_dir = "temp_charts"
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)
        
        # Generate birth chart (suppress all output)
        import sys
        from io import StringIO
        
        # Capture stdout to prevent debug prints
        old_stdout = sys.stdout
        sys.stdout = StringIO()
        
        try:
            chart = KerykeionChartSVG(
                subject,
                chart_type="Natal",
                new_output_directory=temp_dir if not output_path else os.path.dirname(output_path)
            )
            
            # Generate the SVG
            chart.makeSVG()
        finally:
            # Restore stdout
            sys.stdout = old_stdout
        
        # Look for the generated SVG file with different possible names
        possible_filenames = [
            f"{name} - Natal Chart.svg",
            f"{name}_Natal_Chart.svg", 
            f"{name} Natal Chart.svg",
            "Natal Chart.svg"
        ]
        
        svg_path = None
        for filename in possible_filenames:
            test_path = os.path.join(chart.output_directory, filename)
            if os.path.exists(test_path):
                svg_path = test_path
                break
        
        svg_content = ""
        if svg_path and os.path.exists(svg_path):
            with open(svg_path, 'r', encoding='utf-8') as f:
                svg_content = f.read()
            
            # Clean up temp file if not saving permanently
            if not output_path:
                os.remove(svg_path)
                # Try to remove temp directory if empty
                try:
                    os.rmdir(chart.output_directory)
                except OSError:
                    pass  # Directory not empty or other issue
        else:
            # List files in output directory for debugging
            if os.path.exists(chart.output_directory):
                files = os.listdir(chart.output_directory)
                return {
                    "success": False,
                    "error": f"SVG file not found. Available files: {files}. Tried: {possible_filenames}",
                    "svg_content": None,
                    "chart_info": None
                }
            else:
                return {
                    "success": False,
                    "error": f"Output directory not found: {chart.output_directory}",
                    "svg_content": None,
                    "chart_info": None
                }
        
        # Extract chart metadata
        chart_info = {
            "subject_name": subject.name,
            "birth_date": date_str,
            "birth_time": time_str,
            "location": f"{latitude}, {longitude}",
            "sun_sign": subject.sun["sign"],
            "moon_sign": subject.moon["sign"],
            "rising_sign": subject.first_house["sign"],
            "chart_type": "Natal",
            "generated_at": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "svg_content": svg_content,
            "chart_info": chart_info,
            "svg_path": svg_path if output_path else None
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "svg_content": None,
            "chart_info": None
        }

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 5:
        print(json.dumps({"error": "Usage: python chart_visualizer.py <date> <time> <latitude> <longitude> [name] [location] [output_path]"}))
        sys.exit(1)
    
    date_str = sys.argv[1]
    time_str = sys.argv[2] 
    latitude = sys.argv[3]
    longitude = sys.argv[4]
    name = sys.argv[5] if len(sys.argv) > 5 else "Birth Chart"
    location = sys.argv[6] if len(sys.argv) > 6 else ""
    output_path = sys.argv[7] if len(sys.argv) > 7 else None
    
    try:
        result = generate_birth_chart_svg(date_str, time_str, latitude, longitude, name, location, output_path)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": f"Chart generation failed: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()