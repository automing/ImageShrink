import json
import random

def get_color():
    colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    ]
    return random.choice(colors)

# 热门车型数据 - 图片使用占位图
cars = [
    {"name": "比亚迪汉DM-i", "brand": "比亚迪", "price": "16.88万起", "image": "https://placehold.co/400x300/1a73e8/ffffff?text=比亚迪汉", "type": "newEnergy"},
    {"name": "比亚迪秦PLUS", "brand": "比亚迪", "price": "7.98万起", "image": "https://placehold.co/400x300/1a73e8/ffffff?text=秦PLUS", "type": "newEnergy"},
    {"name": "比亚迪海豹", "brand": "比亚迪", "price": "17.58万起", "image": "https://placehold.co/400x300/1a73e8/ffffff?text=海豹", "type": "newEnergy"},
    {"name": "比亚迪宋PLUS", "brand": "比亚迪", "price": "12.98万起", "image": "https://placehold.co/400x300/1a73e8/ffffff?text=宋PLUS", "type": "newEnergy"},
    {"name": "特斯拉Model 3", "brand": "特斯拉", "price": "23.19万起", "image": "https://placehold.co/400x300/e82127/ffffff?text=Model+3", "type": "newEnergy"},
    {"name": "特斯拉Model Y", "brand": "特斯拉", "price": "24.99万起", "image": "https://placehold.co/400x300/e82127/ffffff?text=Model+Y", "type": "newEnergy"},
    {"name": "问界M7", "brand": "问界", "price": "24.98万起", "image": "https://placehold.co/400x300/007acc/ffffff?text=问界M7", "type": "suv"},
    {"name": "问界M9", "brand": "问界", "price": "46.98万起", "image": "https://placehold.co/400x300/007acc/ffffff?text=问界M9", "type": "suv"},
    {"name": "理想L6", "brand": "理想", "price": "24.98万起", "image": "https://placehold.co/400x300/00a0e9/ffffff?text=理想L6", "type": "suv"},
    {"name": "理想L7", "brand": "理想", "price": "30.18万起", "image": "https://placehold.co/400x300/00a0e9/ffffff?text=理想L7", "type": "suv"},
    {"name": "理想L8", "brand": "理想", "price": "33.98万起", "image": "https://placehold.co/400x300/00a0e9/ffffff?text=理想L8", "type": "suv"},
    {"name": "理想L9", "brand": "理想", "price": "42.98万起", "image": "https://placehold.co/400x300/00a0e9/ffffff?text=理想L9", "type": "suv"},
    {"name": "蔚来ET5", "brand": "蔚来", "price": "29.80万起", "image": "https://placehold.co/400x300/0066b1/ffffff?text=ET5", "type": "newEnergy"},
    {"name": "蔚来ET7", "brand": "蔚来", "price": "42.80万起", "image": "https://placehold.co/400x300/0066b1/ffffff?text=ET7", "type": "newEnergy"},
    {"name": "蔚来ES6", "brand": "蔚来", "price": "33.80万起", "image": "https://placehold.co/400x300/0066b1/ffffff?text=ES6", "type": "suv"},
    {"name": "蔚来ES8", "brand": "蔚来", "price": "49.80万起", "image": "https://placehold.co/400x300/0066b1/ffffff?text=ES8", "type": "suv"},
    {"name": "小鹏G6", "brand": "小鹏", "price": "19.99万起", "image": "https://placehold.co/400x300/00a0e9/ffffff?text=G6", "type": "newEnergy"},
    {"name": "小鹏G9", "brand": "小鹏", "price": "26.39万起", "image": "https://placehold.co/400x300/00a0e9/ffffff?text=G9", "type": "newEnergy"},
    {"name": "小鹏P7", "brand": "小鹏", "price": "20.99万起", "image": "https://placehold.co/400x300/00a0e9/ffffff?text=P7", "type": "newEnergy"},
    {"name": "小米SU7", "brand": "小米", "price": "21.59万起", "image": "https://placehold.co/400x300/ff6700/ffffff?text=SU7", "type": "newEnergy"},
    {"name": "极氪001", "brand": "极氪", "price": "26.90万起", "image": "https://placehold.co/400x300/00a0e9/ffffff?text=001", "type": "newEnergy"},
    {"name": "极氪007", "brand": "极氪", "price": "20.99万起", "image": "https://placehold.co/400x300/00a0e9/ffffff?text=007", "type": "newEnergy"},
    {"name": "宝马3系", "brand": "宝马", "price": "29.99万起", "image": "https://placehold.co/400x300/0066b1/ffffff?text=3系", "type": "sedan"},
    {"name": "宝马5系", "brand": "宝马", "price": "43.99万起", "image": "https://placehold.co/400x300/0066b1/ffffff?text=5系", "type": "sedan"},
    {"name": "宝马X3", "brand": "宝马", "price": "39.96万起", "image": "https://placehold.co/400x300/0066b1/ffffff?text=X3", "type": "suv"},
    {"name": "宝马X5", "brand": "宝马", "price": "61.50万起", "image": "https://placehold.co/400x300/0066b1/ffffff?text=X5", "type": "suv"},
    {"name": "奔驰C级", "brand": "奔驰", "price": "30.46万起", "image": "https://placehold.co/400x300/333333/ffffff?text=C级", "type": "sedan"},
    {"name": "奔驰E级", "brand": "奔驰", "price": "37.88万起", "image": "https://placehold.co/400x300/333333/ffffff?text=E级", "type": "sedan"},
    {"name": "奔驰GLC", "brand": "奔驰", "price": "35.18万起", "image": "https://placehold.co/400x300/333333/ffffff?text=GLC", "type": "suv"},
    {"name": "奔驰GLB", "brand": "奔驰", "price": "27.39万起", "image": "https://placehold.co/400x300/333333/ffffff?text=GLB", "type": "suv"},
    {"name": "奥迪A4L", "brand": "奥迪", "price": "32.18万起", "image": "https://placehold.co/400x300/000000/ffffff?text=A4L", "type": "sedan"},
    {"name": "奥迪A6L", "brand": "奥迪", "price": "42.79万起", "image": "https://placehold.co/400x300/000000/ffffff?text=A6L", "type": "sedan"},
    {"name": "奥迪Q5L", "brand": "奥迪", "price": "39.88万起", "image": "https://placehold.co/400x300/000000/ffffff?text=Q5L", "type": "suv"},
    {"name": "奥迪Q3", "brand": "奥迪", "price": "27.88万起", "image": "https://placehold.co/400x300/000000/ffffff?text=Q3", "type": "suv"},
    {"name": "雅阁", "brand": "本田", "price": "17.98万起", "image": "https://placehold.co/400x300/e50012/ffffff?text=雅阁", "type": "sedan"},
    {"name": "思域", "brand": "本田", "price": "12.99万起", "image": "https://placehold.co/400x300/e50012/ffffff?text=思域", "type": "sedan"},
    {"name": "CR-V", "brand": "本田", "price": "18.59万起", "image": "https://placehold.co/400x300/e50012/ffffff?text=CR-V", "type": "suv"},
    {"name": "凯美瑞", "brand": "丰田", "price": "17.98万起", "image": "https://placehold.co/400x300/bf0000/ffffff?text=凯美瑞", "type": "sedan"},
    {"name": "RAV4荣放", "brand": "丰田", "price": "17.58万起", "image": "https://placehold.co/400x300/bf0000/ffffff?text=RAV4", "type": "suv"},
    {"name": "卡罗拉", "brand": "丰田", "price": "11.68万起", "image": "https://placehold.co/400x300/bf0000/ffffff?text=卡罗拉", "type": "sedan"},
    {"name": "汉兰达", "brand": "丰田", "price": "26.88万起", "image": "https://placehold.co/400x300/bf0000/ffffff?text=汉兰达", "type": "suv"},
    {"name": "天籁", "brand": "日产", "price": "17.58万起", "image": "https://placehold.co/400x300/c3002f/ffffff?text=天籁", "type": "sedan"},
    {"name": "轩逸", "brand": "日产", "price": "10.86万起", "image": "https://placehold.co/400x300/c3002f/ffffff?text=轩逸", "type": "sedan"},
    {"name": "逍客", "brand": "日产", "price": "15.49万起", "image": "https://placehold.co/400x300/c3002f/ffffff?text=逍客", "type": "suv"},
    {"name": "帕萨特", "brand": "大众", "price": "18.19万起", "image": "https://placehold.co/400x300/003566/ffffff?text=帕萨特", "type": "sedan"},
    {"name": "迈腾", "brand": "大众", "price": "18.69万起", "image": "https://placehold.co/400x300/003566/ffffff?text=迈腾", "type": "sedan"},
    {"name": "途观L", "brand": "大众", "price": "19.87万起", "image": "https://placehold.co/400x300/003566/ffffff?text=途观L", "type": "suv"},
    {"name": "途岳", "brand": "大众", "price": "15.86万起", "image": "https://placehold.co/400x300/003566/ffffff?text=途岳", "type": "suv"},
    {"name": "ID.3", "brand": "大众", "price": "12.99万起", "image": "https://placehold.co/400x300/003566/ffffff?text=ID.3", "type": "newEnergy"},
]

brands = [
    {"name": "比亚迪", "initial": "B", "image": "https://placehold.co/100x100/c5191e/ffffff?text=比亚迪"},
    {"name": "特斯拉", "initial": "T", "image": "https://placehold.co/100x100/e82127/ffffff?text=特斯拉"},
    {"name": "大众", "initial": "D", "image": "https://placehold.co/100x100/003566/ffffff?text=大众"},
    {"name": "本田", "initial": "B", "image": "https://placehold.co/100x100/e50012/ffffff?text=本田"},
    {"name": "丰田", "initial": "F", "image": "https://placehold.co/100x100/bf0000/ffffff?text=丰田"},
    {"name": "日产", "initial": "R", "image": "https://placehold.co/100x100/c3002f/ffffff?text=日产"},
    {"name": "奔驰", "initial": "B", "image": "https://placehold.co/100x100/333333/ffffff?text=奔驰"},
    {"name": "宝马", "initial": "B", "image": "https://placehold.co/100x100/0066b1/ffffff?text=宝马"},
    {"name": "奥迪", "initial": "A", "image": "https://placehold.co/100x100/000000/ffffff?text=奥迪"},
    {"name": "问界", "initial": "W", "image": "https://placehold.co/100x100/007acc/ffffff?text=问界"},
]

# 添加颜色
cars_with_color = [{**c, "color": get_color()} for c in cars]

result = {"cars": cars_with_color, "brands": brands}

with open('src/data/cars.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"车型: {len(result['cars'])}, 品牌: {len(result['brands'])}")