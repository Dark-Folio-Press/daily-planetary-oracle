#!/usr/bin/env python3
"""
Birth Chart SVG Generator using Kerykeion
Generates professional astrological charts with Swiss Ephemeris accuracy
"""

import sys
import json
import os
import tempfile
import re
from datetime import datetime
from kerykeion import AstrologicalSubject, KerykeionChartSVG

def strip_kerykeion_css(svg_content):
    """
    Surgically remove only conflicting Kerykeion styles while preserving chart structure.
    Keeps the chart visible while allowing our external CSS themes to work.
    """
    # Remove style tags that contain theme CSS (but keep structural elements)
    svg_content = re.sub(r'<style[^>]*>.*?</style>', '', svg_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Only remove problematic background fills (white, cream, beige) that hide cosmic themes
    svg_content = re.sub(r'fill\s*=\s*["\']#?(ffffff|FFFFFF|f5f5dc|F5F5DC|fdf5e6|FDF5E6|fffaf0|FFFAF0)["\']', 'fill="transparent"', svg_content, flags=re.IGNORECASE)
    svg_content = re.sub(r'fill\s*=\s*["\'](?:white|beige|cream)["\']', 'fill="transparent"', svg_content, flags=re.IGNORECASE)
    
    # Remove font-family attributes to allow our CSS theme fonts to take control
    svg_content = re.sub(r'\s+font-family\s*=\s*["\'][^"\']*["\']', '', svg_content, flags=re.IGNORECASE)
    
    # Remove font-size attributes only if they're inline styles (keep structural sizing)
    svg_content = re.sub(r'\s+style\s*=\s*["\'][^"\']*font-size[^"\']*["\']', '', svg_content, flags=re.IGNORECASE)
    
    # Keep all strokes and structural fills - only remove inline style attributes that override CSS
    svg_content = re.sub(r'\s+style\s*=\s*["\'][^"\']*["\']', '', svg_content, flags=re.IGNORECASE)
    
    return svg_content

def generate_birth_chart_svg(date_str, time_str, latitude, longitude, name="Birth Chart", location="", output_path=None, theme="default"):
    """
    Generate a professional birth chart SVG using Kerykeion
    
    Args:
        date_str: Date in YYYY-MM-DD format
        time_str: Time in HH:MM format  
        latitude: Latitude as string or float
        longitude: Longitude as string or float
        name: Chart title/name
        output_path: Optional path to save SVG file
        theme: Kerykeion theme ('default', 'classic', 'light', 'dark', 'dark_high_contrast')
    
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
            # Handle Kerykeion theme parameter mapping
            kerykeion_theme_map = {
                "default": "classic",
                "classic": "classic", 
                "dark": "dark",
                "dark_high_contrast": "dark-high-contrast",
                "light": "light"
            }
            
            chart_kwargs = {
                "first_obj": subject,
                "chart_type": "Natal",
                "new_output_directory": temp_dir if not output_path else os.path.dirname(output_path),
                "theme": kerykeion_theme_map.get(theme, "classic")
            }
            
            chart = KerykeionChartSVG(**chart_kwargs)
            
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
            
            # Strip Kerykeion's inline CSS to prevent override of our themes
            svg_content = strip_kerykeion_css(svg_content)
            
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
            "kerykeion_theme": theme,
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
    theme = sys.argv[8] if len(sys.argv) > 8 else "default"
    
    try:
        result = generate_birth_chart_svg(date_str, time_str, latitude, longitude, name, location, output_path, theme)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": f"Chart generation failed: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()