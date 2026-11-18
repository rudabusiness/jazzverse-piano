from PIL import Image,ImageDraw,ImageFont,ImageFilter
from pathlib import Path
import random, math
P=Path(__file__).parent/'screenshots';P.mkdir(exist_ok=True)
W,H=1600,900
BG='#090c19';SID='#101323';CARD='#181c33';CARD2='#22233e';EDGE='#41405b';WHITE='#f6f2ee';MUTED='#a8a5bd';GOLD='#f1c77b';PURPLE='#ac80f4';BLUE='#6bc8fb';GREEN='#78d5aa'
REG='/usr/share/fonts/opentype/inter/Inter-Regular.otf';BOLD='/usr/share/fonts/opentype/inter/Inter-Bold.otf';SERIF='/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
F={}
for size in [12,14,15,16,18,20,23,26,28,30,36,39,42,48,52,56]:F[('r',size)]=ImageFont.truetype(REG,size);F[('b',size)]=ImageFont.truetype(BOLD,size);F[('s',size)]=ImageFont.truetype(SERIF,size)

def tx(d,x,y,s,size=16,color=WHITE,kind='r'):

 if (kind,size) not in F: F[(kind,size)]=ImageFont.truetype({'r':REG,'b':BOLD,'s':SERIF}[kind],size)
 d.text((x,y),s,font=F[(kind,size)],fill=color)
def rr(d,box,fill=CARD,r=16,outline=EDGE,width=1): d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=width)
def line(d,x1,y1,x2,y2,color=EDGE,w=1):d.line((x1,y1,x2,y2),fill=color,width=w)
def btn(d,x,y,s,primary=True,w=None):
 w=w or max(118,20+int(len(s)*8.1)); rr(d,(x,y,x+w,y+42),GOLD if primary else CARD2,9,outline=GOLD if primary else EDGE);tx(d,x+16,y+11,s,15,'#211c28' if primary else WHITE,'b');return w
def header(d,name,subtitle=''):
 tx(d,274,35,'JAZZVERSE  /  THE AI-POWERED PIANO ACADEMY',12,GOLD,'b');tx(d,274,77,name,42,WHITE,'s')
 if subtitle:tx(d,276,141,subtitle,15,MUTED)
 rr(d,(1414,31,1532,68),CARD2,20);tx(d,1432,42,'12-day streak',12,GOLD)
 d.ellipse((1540,29,1579,68),fill='#d9b47a');tx(d,1547,40,'AC',14,'#211d2d','b')
def shell(name,subtitle='',screen='home',mini=False):
 im=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(im)
 # background beams
 for j in range(12): line(d,250+j*130,0,250+j*130,900,'#13172b',1)
 d.rectangle((0,0,234,H),fill=SID);line(d,234,0,234,H,'#3c3551',2)
 tx(d,29,40,'◖',36,GOLD,'s');tx(d,32,83,'JazzVerse',28,WHITE,'s');tx(d,55,118,'Piano',30,GOLD,'s');tx(d,31,168,'PLAY  •  LEARN  •  IMPROVISE',12,MUTED,'b')
 navs=[('Discover','home'),('My Courses','courses'),('Course Detail','course-detail'),('Interactive Lesson','lesson'),('Notation & Practice','notation'),('AI Coach','coach'),('Challenges','challenges'),('My Progress','progress'),('Repertoire','library'),('Profile & Settings','profile')]
 for i,(n,key) in enumerate(navs):
  y=224+52*i
  if key==screen:rr(d,(17,y-5,219,y+38),'#31283e',11,outline='#6b5171')
  tx(d,35,y+2,('●' if key==screen else '○'),14,GOLD if key==screen else '#676881');tx(d,57,y,n,15,GOLD if key==screen else '#c6c0d4','b' if key==screen else 'r')
 rr(d,(16,775,220,871),'#24213b',13,'#554564');tx(d,32,790,'YOUR JAZZ JOURNEY',12,GOLD,'b');tx(d,32,817,'Level 03  •  64% complete',12,MUTED)
 rr(d,(30,846,201,852),'#433c59',4,outline='#433c59');rr(d,(30,846,139,852),PURPLE,4,outline=PURPLE)
 header(d,name,subtitle)
 # Mascot at corner, unless screen itself is full chat
 mascot(d,mini)
 return im,d

def mascot(d,mini=False):
 x,y=1510,785 if not mini else 822
 rr(d,(x-5,y-7,x+67,889),'#245b99',30,'#9adaff',3)
 d.polygon([(x+4,y+17),(x+12,y-24),(x+29,y+15)],fill='#65a9ed');d.polygon([(x+42,y+14),(x+58,y-21),(x+66,y+22)],fill='#65a9ed')
 d.ellipse((x+11,y+25,x+32,y+53),fill='white');d.ellipse((x+39,y+25,x+60,y+53),fill='white')
 d.ellipse((x+21,y+34,x+32,y+49),fill='#14263d');d.ellipse((x+49,y+34,x+60,y+49),fill='#14263d')
 if not mini:
  d.ellipse((x+30,y+57,x+42,y+64),fill='#17243e')
  rr(d,(x-200,y+17,x-21,y+76),'#2d254c',10,'#9b7fc6');tx(d,x-186,y+24,'Your AI coach',12,GOLD,'b');tx(d,x-186,y+47,'Ready to practice?',13,WHITE)

def c(d,x,y,w,h,title='',tag=''):
 rr(d,(x,y,x+w,y+h),CARD,18)
 if title:tx(d,x+21,y+19,title,19,WHITE,'b')
 if tag: tx(d,x+w-150,y+23,tag,12,GOLD)

def course(d,x,y,w,h,name,style,color):
 rr(d,(x,y,x+w,y+h),color,14,'#6c5377');tx(d,x+16,y+16,style,12,GOLD,'b');tx(d,x+w-90,y+20,'♪',56,'#e2bbfa');tx(d,x+16,y+h-63,name,21,WHITE,'b');tx(d,x+16,y+h-31,'Interactive video course',12,'#d9d4e2')

def keyboard(d,x,y,w,h=185):
 rr(d,(x,y,x+w,y+h),'#14182d',12,'#514166')
 keyh=69; yy=y+h-keyh; n=24;kw=w/n
 for i in range(n):
  xx=x+int(i*kw);d.rectangle((xx,yy,xx+int(kw)-2,y+h-3),fill='#eeeef2' if i not in (7,12,18) else '#c5a5f6',outline='#a2a5b4',width=1)
 for i in range(n-1):
  if i%7 in (0,1,3,4,5):
   xx=x+int((i+.75)*kw);d.rounded_rectangle((xx,yy,xx+kw*.49,yy+39),radius=3,fill='#171628')
 line(d,x,y+h-76,x+w,y+h-76,'#75cfff',2)
 for i,(fx,top,col) in enumerate([(.17,23,PURPLE),(.34,57,BLUE),(.48,10,PURPLE),(.66,37,BLUE),(.80,4,PURPLE)]):
  xx=x+int(fx*w);rr(d,(xx,y+top,xx+int(kw*1.05),yy-10),col,5,col)

def staff(d,x,y,w,h=145):
 rr(d,(x,y,x+w,y+h),'#f4f0e9',11,'#f4f0e9')
 for i,cc in enumerate(['Dm7','G7','Cmaj7']): tx(d,x+int((i+.1)*w/3)+20,y+17,cc,17,'#363446','b')
 for k in range(5):line(d,x+20,y+64+k*12,x+w-18,y+64+k*12,'#817c87',1)
 for i in range(6):
  nx=x+40+int(i*(w-90)/6); ny=y+76+(i%3)*12
  d.ellipse((nx,ny,nx+15,ny+10),fill='#292b36');line(d,nx+13,ny,nx+13,ny-26,'#292b36',2)

def metric(d,x,y,name,num,pc=None):
 rr(d,(x,y,x+225,y+102),CARD2,13);tx(d,x+15,y+14,name,14,MUTED);tx(d,x+15,y+43,num,28,GOLD,'b')
 if pc:rr(d,(x+15,y+86,x+210,y+92),'#514b66',4);rr(d,(x+15,y+86,x+15+int(195*pc/100),y+92),PURPLE,4)

def save(im,name): im.save(P/(name+'.png'),optimize=True)

def home():
 im,d=shell('Discover your next sound','Jazz at the heart. Every style within reach.','home')
 rr(d,(274,190,1562,453),'#292039',21,'#665274');tx(d,309,217,'FEATURED JOURNEY',13,GOLD,'b');tx(d,309,261,'The Complete Jazz',44,WHITE,'s');tx(d,309,315,'Piano Journey',44,GOLD,'s');tx(d,313,378,'From fundamentals to real improvisation, guided by world-class teachers.',15,MUTED)
 btn(d,1040,355,'Continue journey  →',True,207);btn(d,1260,355,'Explore courses',False,177)
 tx(d,276,482,'Explore by genre',24,WHITE,'b')
 for i,(n,st,col) in enumerate([('Jazz','Jazz', '#42314b'),('Classical','Classical','#393447'),('Blues','Blues','#18344b'),('Soul / Gospel','Gospel','#4c3046'),('Pop','Pop','#2c3454')]):course(d,274+i*260,523,244,154,n,st,col)
 tx(d,276,704,'Continue learning',24,WHITE,'b')
 for i,(s,t) in enumerate([('II–V–I Comping','Lesson 6 / 24'),('Rootless Voicings','Recommended for you'),('Swing Groove Challenge','Daily practice')]):
  x=274+i*431;c(d,x,746,410,124,s);tx(d,x+20,793,t,13,MUTED);btn(d,x+270,821,'Open  →',False,113)
 save(im,'home')

def courses():
 im,d=shell('All courses','Your next piano chapter starts here.','courses');tx(d,276,193,'Browse all genres',24,WHITE,'b')
 genres=['All','Jazz','Classical','Blues','Gospel','Soul','Pop']
 for i,g in enumerate(genres):btn(d,275+i*145,237,g,i==0,127)
 for i,(n,st,col) in enumerate([('Jazz Foundations','JAZZ','#49314a'),('Classical Essentials','CLASSICAL','#35344b'),('Blues Piano Basics','BLUES','#1e3c56'),('Soul & Gospel','GOSPEL','#483047'),('Improvisation Lab','JAZZ','#43264d'),('Pop Piano Stories','POP','#273c5f'),('Jazz Standards','JAZZ','#342c4e'),('Swing & Rhythm','JAZZ','#504139')]):
  xx=274+(i%4)*326;yy=302+(i//4)*247;course(d,xx,yy,305,224,n,st,col)
 save(im,'courses')

def detail():
 im,d=shell('Jazz Piano Fundamentals','A complete hands-on learning path with real instructor video.','course-detail')
 c(d,274,190,818,416);tx(d,306,226,'BEGINNER   →   INTERMEDIATE',13,GOLD,'b');tx(d,306,278,'Jazz Piano',52,WHITE,'s');tx(d,306,341,'Fundamentals',52,GOLD,'s');tx(d,310,417,'Harmony, voicings, comping and your first improvisations.',16,MUTED);tx(d,310,457,'24 lessons   •   5h 20m   •   with Marcus Clark',15,MUTED);btn(d,310,520,'Continue course  →',True,230)
 c(d,1111,190,449,255,'Learning outcomes')
 for i,t in enumerate(['Core jazz chords & voicings','Comp with a steady swing feel','Improvise over II–V–I changes','Play three jazz standards']):tx(d,1133,242+i*47,'✓  '+t,15,GREEN)
 c(d,1111,463,449,386,'Course content')
 for i,t in enumerate(['1. Jazz Foundations','2. Chords and Voicings','3. II–V–I Progressions','4. Comping in Swing','5. First Improvisation','6. Jazz Standards']):
  y=523+49*i;tx(d,1133,y,t,15,WHITE);tx(d,1511,y,'›',18,GOLD);line(d,1128,y+35,1533,y+35,'#37354f')
 c(d,274,624,818,225,'Meet your instructor');d.ellipse((302,684,417,799),fill='#755c55');tx(d,337,720,'MC',28,WHITE,'b');tx(d,445,691,'Marcus Clark',26,WHITE,'b');tx(d,445,732,'Jazz pianist, performer and teacher',15,MUTED);tx(d,445,769,'Real recorded lessons + interactive practice + AI guidance',15,MUTED)
 save(im,'course-detail')

def lesson(mini=False):
 im,d=shell('II–V–I Comping in Jazz','Watch the teacher. Play the real keys. Learn the language.','lesson',mini)
 c(d,274,191,198,629,'Lesson steps')
 for i,t in enumerate(['Watch & learn','Guided practice','Play along','Loop & refine','AI check-in']):
  y=259+68*i;rr(d,(288,y,458,y+49),'#3b3143' if i==2 else CARD2,9,'#9b7c60' if i==2 else EDGE);tx(d,302,y+14,('✓ ' if i<2 else '○ ')+t,14,GOLD if i==2 else WHITE)
 c(d,488,191,800,629,'Interactive lesson player')
 rr(d,(507,244,878,491),'#29273d',12,'#746084');tx(d,550,271,'RECORDED INSTRUCTOR VIDEO',15,GOLD,'b');tx(d,572,331,'PLAY',36,WHITE,'s');tx(d,556,392,'Teacher demonstration / captions',16,MUTED);rr(d,(520,462,862,469),'#514462',4);rr(d,(520,462,666,469),PURPLE,4)
 staff(d,897,252,365,210)
 tx(d,516,507,'FALLING NOTES / REAL PIANO INPUT',14,GOLD,'b');keyboard(d,508,541,752,204)
 tx(d,521,775,'▶     1:42 / 4:20        A  ━━━━━━━━━ B          0.75×     1.0×      Tempo 80 BPM',14,WHITE)
 c(d,1304,191,257,629,'Live performance')
 tx(d,1325,251,'92%',45,GREEN,'b');tx(d,1327,309,'Illustrative score',13,MUTED)
 for i,(s,v) in enumerate([('Timing','94%'),('Notes','92%'),('Rhythm','90%')]):metric(d,1318,356+i*113,s,v,90)
 tx(d,1328,737,'Loop bars 5–8',14,WHITE);tx(d,1328,773,'MIDI: demo status',13,MUTED)
 save(im,'lesson-eyes-only' if mini else 'lesson')

def notation():
 im,d=shell('Hybrid music player','One synchronized timeline, three ways to learn.','notation');btn(d,274,191,'Falling notes',False,176);btn(d,466,191,'Sheet music',False,175);btn(d,658,191,'Hybrid ✓',True,154)
 c(d,274,257,909,567,'Notation + keyboard');staff(d,295,320,869,216);keyboard(d,295,555,869,220);c(d,1201,257,357,567,'View preferences')
 for i,t in enumerate(['Show note names','Color-code hands','Highlight chords','Display fingerings','Adaptive assistance','Loop bars 1–4']):
  yy=334+75*i;tx(d,1223,yy,t,15,WHITE);tx(d,1485,yy,'ON',14,GREEN,'b');line(d,1223,yy+40,1535,yy+40,EDGE)
 save(im,'notation')

def coach():
 im,d=shell('Meet your AI Piano Coach','A little companion in the corner, with real lesson context.','coach')
 c(d,274,191,807,627,'Coach conversation')
 rr(d,(595,269,1041,348),'#44365f',16);tx(d,619,290,'Why are my chord changes still uneven?',18,WHITE)
 rr(d,(300,370,1027,552),'#2a2745',16);tx(d,319,386,'MILO  •  AI COACH',14,GOLD,'b');tx(d,319,431,'Your G7 enters a little late in bars 3 and 7.',16,WHITE);tx(d,319,469,'Try guide tones at 60 BPM, then slowly speed up.',16,WHITE);btn(d,319,503,'Create 5-minute exercise',False,251)
 rr(d,(302,580,1034,639),'#20243a',12);tx(d,320,598,'Ask something about the current lesson...',16,MUTED)
 c(d,1100,191,458,627,'Companion display settings')
 for i,(title,desc) in enumerate([('EYES ONLY','Just the eyes peek over the corner'),('FULL CHARACTER','Mascot with tiny contextual bubble'),('HIDDEN','Turn the companion off'),('TEXT ONLY','Accessible, no character motion')]):
  yy=262+i*120;rr(d,(1118,yy,1540,yy+100),CARD2,13);tx(d,1140,yy+18,title,16,GOLD,'b');tx(d,1140,yy+53,desc,14,MUTED)
 save(im,'coach')

def challenges():
 im,d=shell('Practice. Play. Progress.','Challenges reward real musical improvement.','challenges')
 c(d,274,192,776,440,'Today’s challenge');tx(d,305,253,'SWING COMPING CHALLENGE',18,GOLD,'b');tx(d,310,304,'Keep the Groove',40,WHITE,'s');tx(d,311,362,'Play clean chord changes over a 12-bar progression.',17,MUTED)
 tx(d,315,422,'27,860',50,GOLD,'b');tx(d,318,489,'BEST PERSONAL SCORE',13,MUTED,'b');btn(d,313,546,'Play challenge  →',True,250)
 metric(d,1082,193,'Accuracy','94%',94);metric(d,1332,193,'Combo','×56',80);metric(d,1082,312,'Practice time','24 min',70);metric(d,1332,312,'Streak','12 days',90)
 tx(d,276,665,'Achievements',25,WHITE,'b')
 for i,(glyph,title) in enumerate([('★','First jazz lesson'),('♛','7-day streak'),('◷','Timing pro'),('♪','Jazz explorer')]):
  x=274+i*327;c(d,x,704,305,145);tx(d,x+20,725,glyph,30,GOLD);tx(d,x+20,778,title,18,WHITE,'b')
 save(im,'challenges')

def progress():
 im,d=shell('Your musical growth','More than a game score: track the skills that last.','progress')
 c(d,274,191,627,627,'Jazz skill tree');skills=[('Harmony','72%'),('Voicings','48%'),('Swing','63%'),('Ear training','55%'),('Improvisation','29%'),('Repertoire','38%')]
 for i,(n,v) in enumerate(skills):
  x=311+(i%3)*188;y=299+(i//3)*205;d.ellipse((x,y,x+134,y+134),fill='#30263f',outline=GOLD if i<4 else '#6c6482',width=3);tx(d,x+20,y+37,n,14,WHITE,'b');tx(d,x+35,y+76,v,26,GOLD,'b')
 c(d,924,191,636,272,'Weekly practice')
 tx(d,953,254,'4h 36m',43,GOLD,'b');tx(d,1189,268,'+28% vs last week',15,GREEN)
 for i,h in enumerate([65,105,90,132,118,156,94]):
  xx=966+i*75;d.rounded_rectangle((xx,420-h,xx+42,420),radius=5,fill=PURPLE)
  tx(d,xx+5,429,['M','T','W','T','F','S','S'][i],12,MUTED)
 c(d,924,485,636,333,'Skills to improve')
 for i,(s,val) in enumerate([('Jazz improvisation',29),('Voicing transitions',48),('Sight-reading',44)]):
  yy=552+i*77;tx(d,951,yy,s,16,WHITE);tx(d,1478,yy,str(val)+'%',14,GOLD);rr(d,(949,yy+36,1524,yy+43),'#413d58',4);rr(d,(949,yy+36,949+int(575*val/100),yy+43),PURPLE,4)
 save(im,'progress')

def library():
 im,d=shell('Your repertoire','Jazz standards, blues, classical and songs you can really play.','library')
 c(d,274,191,1285,655,'Songs & jazz standards');rr(d,(296,260,1534,318),CARD2,13);tx(d,318,278,'Search song, style, difficulty or composer...',16,MUTED)
 for i,g in enumerate(['Jazz Standards','Classical','Blues','Soul/Gospel','Pop']):btn(d,294+i*246,338,g,i==0,227)
 for i,(name,genre,level) in enumerate([('Autumn Leaves','Jazz Standard','Intermediate'),('Blue Bossa','Latin Jazz','Beginner'),('All the Things You Are','Jazz Standard','Advanced'),("Take the A Train",'Swing','Intermediate'),('Misty','Jazz Ballad','Intermediate')]):
  y=413+i*77;tx(d,314,y,name,19,WHITE,'b');tx(d,828,y,genre,16,MUTED);tx(d,1117,y,level,16,GOLD);btn(d,1376,y-7,'Practice →',False,140);line(d,295,y+43,1533,y+43,'#37334e')
 save(im,'library')

def profile():
 im,d=shell('Your learning profile','Goals, instrument connection and personal preferences.','profile')
 c(d,274,191,623,231,'Your membership');d.ellipse((302,262,424,384),fill='#dbb77f');tx(d,330,307,'AC',35,'#282035','b');tx(d,451,270,'Alex Chen',28,WHITE,'b');tx(d,452,322,'Jazz Learner  •  Level 03',16,MUTED);tx(d,452,359,'Pro subscription',15,GOLD)
 c(d,274,445,623,385,'Your goals')
 for i,t in enumerate(['Play 5 jazz standards  •  2/5','Improve my improvisation','Practice for 30 minutes a day','Learn rootless jazz voicings']):
  yy=510+i*75;tx(d,302,yy,'✓  '+t,16,WHITE);line(d,297,yy+42,867,yy+42,EDGE)
 c(d,923,191,636,313,'Instrument connection');rr(d,(947,274,1530,348),CARD2,13);tx(d,964,293,'●  Yamaha digital piano',19,GREEN,'b');tx(d,965,327,'MIDI connected • USB',13,MUTED);btn(d,948,404,'Manage MIDI devices',False,238)
 c(d,923,526,636,304,'AI companion preferences')
 for i,(label,value) in enumerate([('Appearance','Eyes only / Full'),('Coach voice','Off'),('Practice popups','Quiet mode')]):
  yy=598+i*71;tx(d,950,yy,label,17,WHITE);tx(d,1362,yy,value,14,GOLD);line(d,947,yy+43,1530,yy+43,EDGE)
 save(im,'profile')

home();courses();detail();lesson();lesson(True);notation();coach();challenges();progress();library();profile()
print('Generated',len(list(P.glob('*.png'))),'screenshots')
