"""Draw editable, self-contained vector concepts; final production follows review."""
from pathlib import Path
from html import escape
import argparse
GLYPHS={
'A':['01110','10001','10001','11111','10001','10001','10001'],'B':['11110','10001','10001','11110','10001','10001','11110'],
'C':['01111','10000','10000','10000','10000','10000','01111'],'D':['11110','10001','10001','10001','10001','10001','11110'],
'E':['11111','10000','10000','11110','10000','10000','11111'],'F':['11111','10000','10000','11110','10000','10000','10000'],
'G':['01111','10000','10000','10111','10001','10001','01111'],'H':['10001','10001','10001','11111','10001','10001','10001'],
'I':['11111','00100','00100','00100','00100','00100','11111'],'J':['00111','00010','00010','00010','10010','10010','01100'],
'K':['10001','10010','10100','11000','10100','10010','10001'],'L':['10000','10000','10000','10000','10000','10000','11111'],
'M':['10001','11011','10101','10101','10001','10001','10001'],'N':['10001','11001','10101','10011','10001','10001','10001'],
'O':['01110','10001','10001','10001','10001','10001','01110'],'P':['11110','10001','10001','11110','10000','10000','10000'],
'Q':['01110','10001','10001','10001','10101','10010','01101'],'R':['11110','10001','10001','11110','10100','10010','10001'],
'S':['01111','10000','10000','01110','00001','00001','11110'],'T':['11111','00100','00100','00100','00100','00100','00100'],
'U':['10001','10001','10001','10001','10001','10001','01110'],'V':['10001','10001','10001','10001','10001','01010','00100'],
'W':['10001','10001','10001','10101','10101','10101','01010'],'X':['10001','10001','01010','00100','01010','10001','10001'],
'Y':['10001','10001','01010','00100','00100','00100','00100'],'Z':['11111','00001','00010','00100','01000','10000','11111']}
INK='#171024'; CREAM='#ffe9b3'; PINK='#ef6cab'; BLUE='#74d5d4'; GOLD='#eaba60'
def rect(x,y,w,h,color,stroke=INK,sw=10,r=0): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{color}" stroke="{stroke}" stroke-width="{sw}"/>'
def path(d,color,stroke=INK,sw=10): return f'<path d="{d}" fill="{color}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"/>'
def ellipse(x,y,rx,ry,color,stroke=INK,sw=8,opacity=1): return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{color}" stroke="{stroke}" stroke-width="{sw}" opacity="{opacity}"/>'
def line(d,color=INK,sw=10): return path(d,'none',color,sw)
def lettering(text,x,y,height,color=CREAM):
 unit=height/7; commands=[]; cursor=x
 for char in text:
  if char==' ': cursor+=unit*3; continue
  for row,bits in enumerate(GLYPHS[char]):
   for col,bit in enumerate(bits):
    if bit=='1':
     px=cursor+col*unit;py=y+row*unit
     commands.append(f'M{px:.2f} {py:.2f}h{unit:.2f}v{unit:.2f}h{-unit:.2f}Z')
  cursor+=unit*6
 return path(' '.join(commands),color,INK,max(1,height*.025))
def svg(width,height,body,setting):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><title>{escape(setting)} vector concept</title><desc>Static illustrated nightclub scenery; all decorative furniture sits behind the playable boundary. Lettering is outlined vector geometry.</desc>{body}</svg>\n'
def outside():
 s=rect(0,0,2048,1024,'#242239',sw=0)+rect(90,205,1875,795,'#40304b',sw=18,r=18)
 # Thick shopfront masonry and quieter lower facade.
 for row in range(5):
  yy=220+row*135
  s+=line(f'M110 {yy}H1950','#514059',5)
  for xx in range(160+(row%2)*100,1900,250): s+=line(f'M{xx} {yy}v135','#514059',5)
 s+=path('M55 210L180 90H1840L1995 210Z','#31233c',sw=18)
 s+=rect(220,285,1370,170,INK,PINK,14,18)+rect(248,304,1315,128,'#37253c',BLUE,5,12)
 s+=lettering('BONDI BEACH',375,323,83,PINK)
 s+=rect(345,500,420,385,'#202738',sw=14,r=8)
 for xx in [362,568]: s+=rect(xx,523,178,337,'#3d3451',BLUE,5)
 s+=line('M355 697H760',INK,12)
 # The prominent usable door is on the right, aligned with actual onward travel.
 s+=path('M1510 1024L1450 965V535Q1450 495 1490 495H1880Q1920 495 1920 535V965L1850 1024Z','#65354f',PINK,14)
 s+=rect(1490,536,391,415,'#272033',GOLD,9,18)
 s+=path('M1520 560H1850V943H1520Z','#b16b68',sw=8)
 s+=path('M1600 610L1800 590V945L1600 950Z','#dfb078',sw=8)
 s+=ellipse(1820,800,12,12,CREAM,sw=0)
 s+=lettering('LIVE',1524,565,52,GOLD)
 # Posters and queue posts stay painted into the wall/back strip, never collision nodes.
 for xx,yy,color,word in [(885,530,PINK,'ROCK'),(1100,560,GOLD,'LIVE')]:
  s+=path(f'M{xx} {yy}l175 -20 25 270 -180 15Z',color,sw=8)
  s+=lettering(word,xx+18,yy+30,39,INK)
  s+=path(f'M{xx+35} {yy+140}l95 -20 -25 80 -72 -18Z',CREAM,sw=6)
 for xx in [1120,1330]:
  s+=rect(xx,837,16,153,BLUE,sw=6,r=6)+ellipse(xx+8,835,21,19,GOLD,sw=6)
 s+=line('M1128 855Q1230 925 1338 855',PINK,15)
 s+=lettering('NIGHTS',870,888,42,CREAM)
 return s
def bar():
 s=rect(0,0,2048,1024,'#392b42',sw=0)+rect(100,90,1810,885,'#5c3d4a',sw=16,r=20)
 s+=rect(220,345,1420,365,'#302336',sw=14,r=12)
 for yy in [465,580,698]: s+=rect(230,yy,1400,20,'#a36760',sw=6)
 palette=[BLUE,PINK,GOLD,'#9cbd87','#b887c7']
 for row in range(3):
  for col in range(13):
   x=258+col*101;y=375+row*111
   s+=path(f'M{x+15} {y}h25v20l18 16v55h-62v-55l19-16Z',palette[(col+row)%5],sw=5)
   s+=rect(x-1,y+50,57,19,'#eee0b8',sw=0)
 s+=rect(450,219,1050,104,INK,PINK,10,12)+lettering('BONDI BEACH',530,240,55,CREAM)
 s+=path('M120 743L1710 723L1815 785L150 813Z','#d69574',sw=15)
 s+=path('M150 813L1815 785L1790 997H160Z','#6f4250',sw=14)
 for x in range(270,1600,260): s+=rect(x,832,165,137,'#7c4a51',sw=7,r=10)
 for x in [370,810,1250]:
  s+=ellipse(x,864,82,30,PINK,sw=10)+path(f'M{x-12} 897l-30 107h87l-35-107Z','#b58b73',sw=8)
 # A booth at the far edge of the wall is decorative, well behind world depth -3.
 s+=rect(1818,641,180,339,'#88455e',sw=12,r=30)+rect(1840,821,139,72,'#af6779',sw=8,r=20)
 for x in [310,1030,1750]:
  s+=line(f'M{x} 0v130',GOLD,10)+path(f'M{x-68} 130h136l55 106h-245Z','#c67968',sw=10)+ellipse(x,231,94,14,GOLD,sw=0)
 return s
def dance():
 s=rect(0,0,2048,1024,'#25243b',sw=0)+rect(96,116,1860,825,'#383151',sw=14,r=25)
 s+=rect(325,285,1400,325,'#473863',sw=14,r=24)
 s+=path('M360 575L1670 575L1510 315H525Z','#574571',sw=0)
 s+=rect(665,338,745,111,INK,BLUE,10,20)+lettering('BONDI BEACH',715,365,53,PINK)
 # Speakers, turntables and booth silhouette identify music rather than another route.
 for x in [150,1670]:
  s+=path(f'M{x} 526l210 -20 20 438 -228 10Z','#272331',sw=14)
  for y,r in [(635,57),(808,76)]: s+=ellipse(x+110,y,r,r,'#414054',sw=10)+ellipse(x+110,y,r*.48,r*.48,'#242332',BLUE,5)
 s+=path('M510 692L1500 692L1550 942H460Z','#574760',sw=15)
 s+=path('M510 692L1500 692L1452 770H550Z','#b58b97',sw=10)
 for x in [785,1200]: s+=ellipse(x,713,120,28,'#1d2031',sw=8)+ellipse(x,713,53,15,BLUE,sw=4)
 for x in [965,1030,1090]: s+=rect(x,683,18,50,GOLD,sw=3,r=5)
 s+=line('M110 165H1940','#ae929f',24)
 for x,color in [(285,PINK),(800,BLUE),(1310,PINK),(1830,GOLD)]:
  s+=path(f'M{x-46} 170h90l24 100 -64 40 -76-48Z','#51495d',sw=10)
  s+=ellipse(x,282,41,21,color,sw=6)
  s+=path(f'M{x-22} 296L{x-165} 700L{x+175} 700L{x+22} 296Z',color,sw=0).replace('fill="'+color+'"','fill="'+color+'" opacity="0.12"')
 # Static hanging disco fixture; no blinking animation.
 s+=ellipse(1050,180,55,55,'#c7bbce',sw=9)+line('M1020 130L1070 228M1000 180H1100',BLUE,5)
 return s
def stage():
 s=rect(0,0,2048,1024,'#30243b',sw=0)
 s+=rect(290,140,1480,792,'#51354c',GOLD,14,20)
 s+=path('M190 75H1870L1840 205H240Z','#79435d',sw=16)
 for side in [0,1]:
  x=80 if side==0 else 1610
  s+=path(f'M{x} 170h340v740q-130-35-315 50Z','#923d61',sw=14)
  for dx in [70,145,220,295]: s+=line(f'M{x+dx} 180q-40 335 0 740','#bc5673',10)
 s+=rect(660,365,760,135,INK,PINK,12,20)+lettering('BONDI BEACH',715,396,60,GOLD)
 s+=path('M580 545H1490L1370 760H705Z','#604260',sw=10)
 s+=path('M535 820H1550L1710 987H345Z','#83556a',sw=14)
 s+=line('M405 945H1640',GOLD,8)
 # VIP seating and stage elevation are in the illustrated rear wall, never platforms.
 for x in [245,1500]:
  s+=rect(x,704,300,230,'#984e68',sw=12,r=42)+rect(x+25,844,250,86,'#b9637d',sw=8,r=20)
  s+=line(f'M{x+104} 725v107M{x+201} 725v107','#72364e',9)
 for x in [610,1435]:
  s+=path(f'M{x-70} 120h140l-35 140h-70Z','#564355',sw=10)+ellipse(x,256,43,18,GOLD,sw=7)
  s+=path(f'M{x-20} 270L{x-200} 800L{x+200} 800L{x+20} 270Z',GOLD,sw=0).replace('fill="'+GOLD+'"','fill="'+GOLD+'" opacity="0.12"')
 return s
def floor(setting):
 bg={'outside-entrance':'#494456','bar':'#4d3c4a','dance-floor':'#393748','stage-vip':'#403342'}[setting]
 s=rect(0,0,1024,512,bg,sw=0)
 if setting=='outside-entrance':
  for yy in [36,145,290,475]: s+=line(f'M0 {yy}H1024','#534e5e',3)
  for x in [230,510,790]: s+=line(f'M{x} 0v512','#534e5e',3)
  s+=path('M870 0H1005L890 118H835Z','#b38167',sw=0)
 elif setting=='bar':
  for x in range(0,1025,128): s+=line(f'M{x} 0v512','#564450',3)
  s+=line('M0 52H1024M0 455H1024','#6e4c56',8)
 elif setting=='dance-floor':
  for x in range(0,1025,128): s+=line(f'M{x} 0v512','#454052',2)
  for y in range(0,513,128): s+=line(f'M0 {y}H1024','#454052',2)
  for x,y,color in [(140,70,PINK),(880,65,BLUE),(165,448,BLUE),(845,440,PINK)]: s+=ellipse(x,y,170,65,color,sw=0,opacity=.08)
 else:
  s+=line('M0 28H1024M0 485H1024','#614453',7)
  for x in range(75,1024,145): s+=ellipse(x,25,38,12,GOLD,sw=0,opacity=.10)
 return s
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--final',action='store_true');args=parser.parse_args()
 settings=['outside-entrance','bar','dance-floor','stage-vip'];functions=[outside,bar,dance,stage]
 for setting,draw in zip(settings,functions):
  base=Path('assets/backdrops')/(setting if args.final else 'concepts/'+setting);base.mkdir(parents=True,exist_ok=True)
  (base/'wall.svg').write_text(svg(2048,1024,draw(),setting))
  (base/'floor.svg').write_text(svg(1024,512,floor(setting),setting))
 print('Final panels produced' if args.final else 'Four vector concept pairs produced; final panels await concept review')
