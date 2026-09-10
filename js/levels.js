/* הערכים האפשריים לכל מאפיין שניתן לשלוט בו במשחק */
const PROPERTY_OPTIONS = {
  'display': ['block', 'flex'],
  'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
  'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
  'align-items': ['flex-start', 'flex-end', 'center'],
  'flex-wrap': ['nowrap', 'wrap', 'wrap-reverse']
};

/* ערכי ברירת המחדל של הלוח בתחילת כל שלב */
const DEFAULT_STYLES = {
  'display': 'flex',
  'flex-direction': 'row',
  'justify-content': 'flex-start',
  'align-items': 'flex-start',
  'flex-wrap': 'nowrap'
};

/*
 * כל שלב מכיל:
 * mission   – ההוראה שמוצגת למשתמש
 * hint      – רמז אופציונלי
 * ships     – מספר הפריטים בלוח והאייקון שלהם
 * controls  – המאפיינים שהמשתמש יכול לשנות בשלב זה
 * start     – ערכי הפתיחה של השלב (מתמזגים עם ברירת המחדל)
 * solution  – הערכים שנחשבים לפתרון נכון
 */
const LEVELS = [
  {
    title: 'הפעלת המנועים',
    mission: 'הלוח שלנו הוא עדיין קופסה רגילה, והחלליות יושבות אחת מתחת לשנייה. הפכו את הלוח ל-Flex Container כדי שהחלליות יסתדרו בשורה אחת.',
    hint: 'המאפיין שהופך אלמנט למיכל גמיש הוא display.',
    ships: 3,
    icon: '🚀',
    controls: ['display'],
    start: { 'display': 'block' },
    solution: { 'display': ['flex'] }
  },
  {
    title: 'עגינה בצד ימין',
    mission: 'תחנת החלל נמצאת בצד ימין של הלוח. הזיזו את כל החלליות אל הקצה הימני, בלי לשנות את הגובה שלהן.',
    hint: 'המאפיין justify-content שולט על הסידור לאורך הציר הראשי (במקרה הזה, לרוחב).',
    ships: 3,
    icon: '🚀',
    controls: ['justify-content'],
    solution: { 'justify-content': ['flex-end'] }
  },
  {
    title: 'נחיתה על הקרקע',
    mission: 'הגיע הזמן לנחות. הורידו את כל החלליות אל תחתית הלוח, כשהן נשארות צמודות לצד שמאל.',
    hint: 'align-items שולט על הציר המשני – במקרה הזה, לגובה.',
    ships: 3,
    icon: '🛸',
    controls: ['align-items'],
    solution: { 'align-items': ['flex-end'] }
  },
  {
    title: 'מרכז הגלקסיה',
    mission: 'רכזו את שלוש החלליות בדיוק במרכז הלוח – גם לרוחב וגם לגובה.',
    hint: 'צריך לשלב שני מאפיינים: אחד לציר הראשי ואחד לציר המשני.',
    ships: 3,
    icon: '🪐',
    controls: ['justify-content', 'align-items'],
    solution: { 'justify-content': ['center'], 'align-items': ['center'] }
  },
  {
    title: 'מגדל השיגור',
    mission: 'סדרו את החלליות בטור אחד מלמעלה למטה, כשהן ממורכזות לרוחב הלוח ומתחילות מלמעלה.',
    hint: 'כששינו את flex-direction ל-column, הציר הראשי הופך לאנכי – ולכן align-items הוא זה ששולט על הרוחב.',
    ships: 4,
    icon: '🛰️',
    controls: ['flex-direction', 'align-items'],
    solution: { 'flex-direction': ['column'], 'align-items': ['center'] }
  },
  {
    title: 'מסלול הנחיתה',
    mission: 'פזרו את החלליות לרוחב הלוח כך שהראשונה תיגע בקצה שמאל, האחרונה בקצה ימין, והמרווחים ביניהן יהיו שווים – וכולן ינחתו בתחתית הלוח.',
    hint: 'space-between דוחף את הפריטים הראשון והאחרון אל הקצוות.',
    ships: 4,
    icon: '🚀',
    controls: ['justify-content', 'align-items'],
    solution: { 'justify-content': ['space-between'], 'align-items': ['flex-end'] }
  },
  {
    title: 'ספירה לאחור',
    mission: 'סדרו את החלליות בטור אנכי הפוך: חללית מספר 1 תהיה התחתונה, מספר 4 תהיה העליונה, וכל הקבוצה תהיה צמודה לחלק העליון של הלוח.',
    hint: 'ב-column-reverse הציר הראשי מתחיל מלמטה, ולכן flex-end מצביע כלפי מעלה.',
    ships: 4,
    icon: '🛸',
    controls: ['flex-direction', 'justify-content'],
    solution: { 'flex-direction': ['column-reverse'], 'justify-content': ['flex-end'] }
  },
  {
    title: 'צי גדול מדי',
    mission: 'יש כאן יותר מדי חלליות מכדי שייכנסו לשורה אחת. אפשרו להן לרדת לשורה הבאה, וודאו שכל שורה ממורכזת לרוחב הלוח.',
    hint: 'flex-wrap מאפשר "גלישה" לשורה חדשה במקום לדחוס את הפריטים.',
    ships: 10,
    icon: '🚀',
    controls: ['flex-wrap', 'justify-content'],
    solution: { 'flex-wrap': ['wrap'], 'justify-content': ['center'] }
  },
  {
    title: 'תמרון הפוך',
    mission: 'הפכו את סדר החלליות כך שמספר 1 תופיע בקצה ימין, פזרו אותן במרווחים שווים סביב כל אחת מהן, ומרכזו את כולן לגובה הלוח.',
    hint: 'שלושה מאפיינים ביחד: כיוון הפוך, פיזור מסוג space-around, ומרכוז בציר המשני.',
    ships: 4,
    icon: '🪐',
    controls: ['flex-direction', 'justify-content', 'align-items'],
    solution: {
      'flex-direction': ['row-reverse'],
      'justify-content': ['space-around'],
      'align-items': ['center']
    }
  },
  {
    title: 'מערך העגינה',
    mission: 'סדרו את החלליות בטורים מלמעלה למטה: כאשר טור מתמלא, החלליות הבאות ימשיכו לטור נוסף לצידו.',
    hint: 'שילוב של כיוון אנכי יחד עם גלישה יוצר טורים במקום שורות.',
    ships: 9,
    icon: '🛰️',
    controls: ['flex-direction', 'flex-wrap'],
    solution: { 'flex-direction': ['column'], 'flex-wrap': ['wrap'] }
  }
];
