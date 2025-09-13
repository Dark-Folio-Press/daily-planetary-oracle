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
from bs4 import BeautifulSoup

def clean_svg_response(svg_output: str) -> str:
    """
    Selective SVG cleaning function that removes inline styles and background fills only,
    while preserving content element colors for better theming control.
    """
    try:
        soup = BeautifulSoup(svg_output, 'xml')
        
        # Get SVG dimensions for background detection
        svg_root = soup.find('svg')
        if not svg_root:
            return svg_output
            
        viewbox = svg_root.get('viewBox', '0 0 820 550').split()
        svg_width = float(viewbox[2]) if len(viewbox) >= 3 else 820
        svg_height = float(viewbox[3]) if len(viewbox) >= 4 else 550
        
        def is_background_shape(tag, svg_width, svg_height):
            """Identify background shapes that should have transparent fills"""
            element_id = tag.get('id', '').lower()
            
            # Check for background-related IDs
            if any(bg_term in element_id for bg_term in ['background', 'bg', 'frame', 'border']):
                return True
                
            # Check for large rects covering most of the SVG
            if tag.name == 'rect':
                width = float(tag.get('width', 0))
                height = float(tag.get('height', 0))
                if width >= svg_width * 0.95 or height >= svg_height * 0.95:
                    return True
                    
            # Check for large circles/ellipses near center
            if tag.name in ['circle', 'ellipse']:
                if tag.name == 'circle':
                    radius = float(tag.get('r', 0))
                    cx = float(tag.get('cx', svg_width/2))
                    cy = float(tag.get('cy', svg_height/2))
                    # Large circles near center are likely background
                    if (radius >= min(svg_width, svg_height) * 0.45 and 
                        abs(cx - svg_width/2) < svg_width * 0.1 and 
                        abs(cy - svg_height/2) < svg_height * 0.1):
                        return True
                        
            return False

        # Remove inline styles from all elements
        for tag in soup.find_all(True):
            if not hasattr(tag, 'has_attr'):
                continue
                
            # Always remove inline styles
            if tag.has_attr('style'):
                del tag['style']

            # Only remove fills from background shapes, preserve content colors
            if is_background_shape(tag, svg_width, svg_height):
                if tag.has_attr('fill'):
                    tag['fill'] = 'none'  # Make background transparent
                # Mark as background for CSS targeting
                tag['data-role'] = 'background'

            # Add semantic CSS classes based on element characteristics
            element_id = tag.get('id', '').lower()
            text_content = tag.text.strip().lower() if tag.text else ''

            # Add classes based on heuristics for better CSS targeting
            if 'planet' in element_id or 'planet' in text_content:
                tag['class'] = 'planet'
            elif 'sign' in element_id or 'sign' in text_content:
                tag['class'] = 'sign'
            elif 'aspect' in element_id:
                tag['class'] = 'aspect-line'
            elif 'house' in element_id:
                tag['class'] = 'house-line'
            elif tag.name == 'text':
                tag['class'] = 'chart-text'

        # Remove any embedded <style> blocks that define fills/strokes
        for style_tag in soup.find_all('style'):
            style_tag.decompose()

        return str(soup)
    except Exception as e:
        # Fallback to original content if parsing fails
        print(f"Warning: Could not clean SVG response: {e}")
        return svg_output

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
            
            # Clean SVG by removing inline styles, hardcoded attributes, and adding semantic classes
            svg_content = clean_svg_response(svg_content)
            
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