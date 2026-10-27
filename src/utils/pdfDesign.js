export default function pdfDesign(doc,title){

// OUTER BORDER

doc.setDrawColor(132,88,179);

doc.setLineWidth(1);

doc.rect(8,8,194,281);

// WATERMARK

doc.addImage(
"/logo/watermark.png",
"PNG",
45,
70,
120,
120
);

// TOP LOGO

doc.addImage(
"/logo/fanmeni.png",
"PNG",
85,
10,
40,
40
);

// TITLE

doc.setFont("times","bold");

doc.setFontSize(24);

doc.text("FANMENI 26",105,60,{
align:"center"
});

doc.setFontSize(15);

doc.text(title,105,70,{
align:"center"
});

// DIVIDER

doc.line(20,78,190,78);

}