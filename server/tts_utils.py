# Utility: Convert e.g. 59°F -> 59 degrees Fahrenheit, 20°C -> 20 degrees Celsius
import re

def tts_friendly(text):
    if not text:
        return text
    # Temperature conversions
    text = re.sub(r"(\d+)\s*(?:°\s*)?[Ff](\b|ahrenheit\b)", r"\1 degrees Fahrenheit", text)
    text = re.sub(r"(\d+)\s*(?:°\s*)?[Cc](\b|elsius\b)", r"\1 degrees Celsius", text)
    text = re.sub(r"(\d+)\s*°", r"\1 degrees", text)

    # Address and direction abbreviations
    replacements = [
        (r"\bSt\.?\b", "Street"),
        (r"\bAve\.?\b", "Avenue"),
        (r"\bRd\.?\b", "Road"),
        (r"\bBlvd\.?\b", "Boulevard"),
        (r"\bDr\.?\b", "Drive"),
        (r"\bLn\.?\b", "Lane"),
        (r"\bPkwy\.?\b", "Parkway"),
        (r"\bCt\.?\b", "Court"),
        (r"\bPl\.?\b", "Place"),
        (r"\bSq\.?\b", "Square"),
        (r"\bTer\.?\b", "Terrace"),
        (r"\bCir\.?\b", "Circle"),
        (r"\bHwy\.?\b", "Highway"),
        (r"\bMt\.?\b", "Mount"),
        (r"\bFt\.?\b", "Fort"),
        # Directions (avoid replacing in words)
        (r"\bN\b", "North"),
        (r"\bS\b", "South"),
        (r"\bE\b", "East"),
        (r"\bW\b", "West"),
        (r"\bNE\b", "Northeast"),
        (r"\bNW\b", "Northwest"),
        (r"\bSE\b", "Southeast"),
        (r"\bSW\b", "Southwest"),
    ]
    # State abbreviations
    state_abbr = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
        'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
        'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
        'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
        'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
        'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
        'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
        'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
        'DC': 'District of Columbia'
    }
    for abbr, fullname in state_abbr.items():
        # Replace only if the abbreviation is a separate word (case-insensitive)
        text = re.sub(rf'\b{abbr}\b', fullname, text, flags=re.IGNORECASE)
    return text
