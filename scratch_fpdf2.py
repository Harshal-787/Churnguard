from fpdf import FPDF
pdf = FPDF()
pdf.add_page()
pdf.set_font("Helvetica", size=16)
pdf.cell(200, 10, txt="Hello", ln=1, align='C')
res = pdf.output(dest='S')
print(type(res))
