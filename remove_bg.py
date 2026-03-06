from PIL import Image

def remove_white_bg(in_path, out_path):
    img = Image.open(in_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # If the pixel is close to white, make it transparent
        if item[0] > 220 and item[1] > 220 and item[2] > 220:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(out_path, "PNG")

if __name__ == "__main__":
    remove_white_bg(r"f:\Work\CCTV\cctv-survey-app\public\logo.png", r"f:\Work\CCTV\cctv-survey-app\public\logo-transparent.png")
