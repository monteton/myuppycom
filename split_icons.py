from PIL import Image
import os

def split_image(image_path, prefix, start_index):
    try:
        img = Image.open(image_path)
        width, height = img.size
        part_width = width // 3
        
        for i in range(3):
            # Define crop box (left, top, right, bottom)
            left = i * part_width
            right = (i + 1) * part_width
            # Adjust last part to include remainder pixels
            if i == 2:
                right = width
            
            box = (left, 0, right, height)
            part = img.crop(box)
            
            # Save
            output_filename = f"icon_{start_index + i}.png"
            output_path = os.path.join(os.path.dirname(image_path), output_filename)
            part.save(output_path)
            print(f"Saved {output_path}")

    except Exception as e:
        print(f"Error processing {image_path}: {e}")

base_dir = "/Volumes/SSD1TB-A/САЙТЫ/МАРАФОН ФЕВРАЛЬ/images"
split_image(os.path.join(base_dir, "set1.png"), "icon", 1)
split_image(os.path.join(base_dir, "set2.png"), "icon", 4)
