from PIL import Image, ImageDraw, ImageFont

font_size = 109
font_path = '/usr/share/fonts/google-noto-emoji/NotoColorEmoji.ttf'
#font_path = '/usr/share/fonts/emoji/NotoColorEmoji.ttf'
image_width = 128
image_height = 128
emoji_char = '🦊'

emojis = {
    'fox.png': '🦊',
    'wulf.png': '🐺',
    'wall.png': '⬛',
    'raccoon.png': '🦝',    
    'alien.png': '👽',
    'web.png': '🕸',    
    'bomb.png': '💣',
    'bow.png': '🏹',    
    'knife.png': '🔪',
    'boomerang.png': '🪃',
    'shield.png': '🛡',
    'magnet.png': '🧲',
    'pill.png': '💊',
    'trap.png': '🪤',
    'radioactive.png': '☢',
    'biohazard.png': '☣',    
    'mushroom.png': '🍄‍',
    'barrel.png': '🛢',
    'watch.png': '⌚',
    'lightning.png': '⚡',
    'snow.png': '❄',
    'fire.png': '🔥',
    'water.png': '💧',
    'balloon.png': '🎈',
    'gun.png': '🔫',
    'wand.png': '🪄',
    'needle.png': '🪡',
    'diamond.png': '💎',
    'ring.png': '💍',
    'light.png': '💡',
    'candle.png': '🕯',
    'coin.png': '🪙',
    'money.png': '💵',
    'key.png': '🔑',    
    'hole.png': '🕳',
    'ninja.png': '🥷',
    'eye.png': '👁',    
}

def save(filename, emoji):
    image = Image.new('RGBA', (image_width, image_height), (255, 255, 255, 0))
    draw = ImageDraw.Draw(image)        
    font = ImageFont.truetype(font_path, font_size)

    bbox = draw.textbbox((0, 0), emoji, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (image_width - text_width)*0.5
    y = (image_height - text_height)*0.5
       
    draw.text((x, y), emoji, fill="white", embedded_color=True, font=font)
    
    image.save(filename)

def main():
    for filename, emoji in emojis.items():
        save(filename, emoji)
        print(f'{emoji} {filename}')
        
main()
