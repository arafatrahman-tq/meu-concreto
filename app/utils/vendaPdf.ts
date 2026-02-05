import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateVendaPdf = (venda: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const orcamento = venda.orcamento;
  const empresa = venda.empresa;

  // Design Tokens (Intelligence Platform - Matches Orcamento PDF)
  const colors = {
    brand: [255, 122, 61] as [number, number, number], // #ff7a3d
    primary: [15, 23, 42] as [number, number, number], // #0f172a
    secondary: [100, 116, 139] as [number, number, number], // #64748b
    muted: [241, 245, 249] as [number, number, number], // #f1f5f9
    border: [226, 232, 240] as [number, number, number], // #e2e8f0
    white: [255, 255, 255] as [number, number, number],
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val / 100);
  };

  const formatDate = (date: any) => {
    if (!date) return "---";
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  const maskCpfCnpj = (val: string) => {
    const clean = String(val).replace(/\D/g, "");
    if (clean.length <= 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return clean.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  };

  const maskPhone = (val: string) => {
    const clean = String(val).replace(/\D/g, "");
    if (clean.length === 11) {
      return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    if (clean.length === 10) {
      return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return val;
  };

  // --- Background Decor ---
  doc.setFillColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.rect(0, 0, pageWidth, 45, "F");

  // --- Watermark Implementation ---
  doc.saveGraphicsState();
  // @ts-ignore
  const gState = new (doc as any).GState({ opacity: 0.04 });
  doc.setGState(gState);

  if (empresa?.logo) {
    try {
      const imgSize = 100;
      doc.addImage(
        empresa.logo,
        "PNG",
        (pageWidth - imgSize) / 2,
        (pageHeight - imgSize) / 2,
        imgSize,
        imgSize,
        undefined,
        "FAST",
      );
    } catch (e) {
      doc.setFontSize(50);
      doc.setTextColor(
        colors.secondary[0],
        colors.secondary[1],
        colors.secondary[2],
      );
      doc.text(
        (empresa?.empresa || "SISTEMA").toUpperCase(),
        pageWidth / 2,
        pageHeight / 2,
        {
          align: "center",
          angle: 45,
        },
      );
    }
  }
  doc.restoreGraphicsState();

  // --- Header Section ---
  // Accent Bar
  doc.setFillColor(colors.brand[0], colors.brand[1], colors.brand[2]);
  doc.rect(0, 0, 5, 45, "F");

  // Logo / Company Name
  if (empresa?.logo) {
    try {
      doc.addImage(empresa.logo, "PNG", 15, 8, 28, 28);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      const fullEmpresaName =
        `${empresa.empresa}${empresa.filial ? ` - ${empresa.filial}` : ""}`.toUpperCase();
      doc.text(fullEmpresaName, 50, 20);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(
        colors.secondary[0],
        colors.secondary[1],
        colors.secondary[2],
      );
      doc.text(
        `${empresa.cnpj ? maskCpfCnpj(empresa.cnpj) : ""} ${empresa.telefone ? " | " + maskPhone(empresa.telefone) : ""}`,
        50,
        26,
      );
      doc.text(
        `${empresa.endereco || ""}${empresa.bairro ? ", " + empresa.bairro : ""}`,
        50,
        31,
      );
      doc.text(`${empresa.email || ""}`, 50, 36);
    } catch (e) {
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      const fallbackName =
        `${empresa?.empresa || "MEU CONCRETO"}${empresa?.filial ? ` - ${empresa.filial}` : ""}`.toUpperCase();
      doc.text(fallbackName, 20, 25);
    }
  } else {
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    const fallbackName =
      `${empresa?.empresa || "MEU CONCRETO"}${empresa?.filial ? ` - ${empresa.filial}` : ""}`.toUpperCase();
    doc.text(fallbackName, 20, 25);
  }

  // Document Type Header
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("COMPROVANTE DE VENDA", pageWidth - 20, 25, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(
    colors.secondary[0],
    colors.secondary[1],
    colors.secondary[2],
  );
  doc.text(
    `Ref: #VEN-${String(venda.id).padStart(5, "0")}`,
    pageWidth - 20,
    32,
    { align: "right" },
  );

  // --- Grid Layout for Info Sections ---
  const midPoint = pageWidth / 2;

  // Customer Column
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO CLIENTE", 20, 60);
  doc.setDrawColor(colors.brand[0], colors.brand[1], colors.brand[2]);
  doc.setLineWidth(0.5);
  doc.line(20, 62, 40, 62);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(
    colors.secondary[0],
    colors.secondary[1],
    colors.secondary[2],
  );

  let currentY = 70;
  const infoLeft = [
    { label: "Cliente", value: orcamento?.nomeCliente },
    {
      label: "Documento",
      value: orcamento?.cpfCnpj ? maskCpfCnpj(orcamento.cpfCnpj) : "---",
    },
    {
      label: "Contato",
      value: orcamento?.telefone ? maskPhone(orcamento.telefone) : "---",
    },
    {
      label: "Endereço",
      value: orcamento?.enderecoEntrega || orcamento?.endereco || "---",
    },
    { label: "Bairro", value: orcamento?.bairro || "---" },
    {
      label: "Cidade/UF",
      value: `${orcamento?.cidade || "---"} / ${orcamento?.estado || "---"}`,
    },
  ];

  infoLeft.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${item.label}:`, 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(String(item.value || "").toUpperCase(), 45, currentY);
    currentY += 5.5;
  });

  // Logistics Column
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text("LOGÍSTICA E OPERAÇÃO", midPoint + 10, 60);
  doc.line(midPoint + 10, 62, midPoint + 30, 62);

  doc.setTextColor(
    colors.secondary[0],
    colors.secondary[1],
    colors.secondary[2],
  );
  currentY = 70;
  const infoRight = [
    { label: "Data Venda", value: formatDate(venda.dataVenda) },
    {
      label: "Serv. Bomba",
      value: orcamento?.bombaNecessaria ? "SIM (HABILITADO)" : "NÃO UTILIZA",
    },
    { label: "Motorista", value: orcamento?.motorista?.nome || "A DEFINIR" },
    { label: "Caminhão", value: orcamento?.caminhao?.placa || "A DEFINIR" },
    { label: "Lacre", value: orcamento?.lacre || "NÃO INFORMADO" },
    { label: "Vendedor", value: orcamento?.vendedor?.nome || "---" },
  ];

  infoRight.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${item.label}:`, midPoint + 10, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(String(item.value || "").toUpperCase(), midPoint + 40, currentY);
    currentY += 5.5;
  });

  // --- Items Table ---
  const tableData = [
    [
      orcamento?.produtoNome?.toUpperCase() || "PRODUTO NÃO ESPECIFICADO",
      { content: `${orcamento?.qtd || 0} m³`, styles: { halign: "center" } },
      {
        content: formatCurrency(orcamento?.valorUnit || 0),
        styles: { halign: "right" },
      },
      {
        content: formatCurrency(
          (orcamento?.qtd || 0) * (orcamento?.valorUnit || 0),
        ),
        styles: { halign: "right" },
      },
    ],
  ];

  autoTable(doc, {
    startY: 110,
    head: [
      [
        "ESPECIFICAÇÃO DO PRODUTO / TRAÇO",
        "QUANTIDADE",
        "PREÇO UNIT.",
        "TOTAL",
      ],
    ],
    body: tableData,
    styles: { font: "helvetica", fontSize: 8, cellPadding: 4 },
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.white,
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    columnStyles: {
      0: { cellWidth: "auto", fontStyle: "bold" },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40, fontStyle: "bold" },
    },
    margin: { left: 20, right: 20 },
  });

  // --- COMPOSITION (INSUMOS) ---
  const activeTrace = orcamento?.produto?.tracos?.[0];
  if (activeTrace && activeTrace.itens?.length > 0) {
    let compositionY = (doc as any).lastAutoTable.finalY + 12;
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("COMPOSIÇÃO TÉCNICA E CARGA", 20, compositionY);
    doc.setDrawColor(colors.brand[0], colors.brand[1], colors.brand[2]);
    doc.line(20, compositionY + 2, 40, compositionY + 2);

    const insumosBody = activeTrace.itens.map((item: any) => {
      const calcQtd = (item.quantidade * orcamento.qtd).toFixed(2);
      return [
        item.insumo?.nome?.toUpperCase() || "N/A",
        {
          content: `${item.quantidade} ${item.insumo?.unidadeMedida || ""} / m³`,
          styles: { halign: "center" },
        },
        {
          content: `${calcQtd} ${item.insumo?.unidadeMedida || ""}`,
          styles: { halign: "right" },
        },
      ];
    });

    autoTable(doc, {
      startY: compositionY + 6,
      head: [["INSUMO", "DOSAGEM (POR M³)", "QUANTIDADE TOTAL NA CARGA"]],
      body: insumosBody,
      styles: { font: "helvetica", fontSize: 7, cellPadding: 3 },
      headStyles: {
        fillColor: colors.muted,
        textColor: colors.primary,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 50 },
        2: { cellWidth: 50, fontStyle: "bold" },
      },
      margin: { left: 20, right: 20 },
    });
  }

  let finalY = (doc as any).lastAutoTable.finalY + 12;

  // --- Financial Summary Section ---
  doc.setFontSize(8);
  doc.setTextColor(
    colors.secondary[0],
    colors.secondary[1],
    colors.secondary[2],
  );

  if (orcamento?.bombaNecessaria) {
    doc.setFont("helvetica", "normal");
    doc.text("SERVIÇO DE BOMBAGEM:", pageWidth - 100, finalY);
    doc.setFont("helvetica", "bold");
    doc.text(
      formatCurrency(orcamento.valorBomba || 0),
      pageWidth - 20,
      finalY,
      { align: "right" },
    );
    finalY += 6;
  }

  if (orcamento?.valorDesconto > 0) {
    doc.setFont("helvetica", "normal");
    doc.text("DESCONTO APLICADO:", pageWidth - 100, finalY);
    doc.setTextColor(220, 38, 38);
    doc.setFont("helvetica", "bold");
    doc.text(
      `- ${formatCurrency(orcamento.valorDesconto)}`,
      pageWidth - 20,
      finalY,
      { align: "right" },
    );
    doc.setTextColor(
      colors.secondary[0],
      colors.secondary[1],
      colors.secondary[2],
    );
    finalY += 6;
  }

  // Total Box
  finalY += 4;
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(pageWidth - 90, finalY, 70, 22, 2, 2, "F");
  doc.setFillColor(colors.brand[0], colors.brand[1], colors.brand[2]);
  doc.rect(pageWidth - 90, finalY, 2, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("TOTAL DA VENDA", pageWidth - 83, finalY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(formatCurrency(venda.valorTotal), pageWidth - 25, finalY + 16, {
    align: "right",
  });

  // --- Signature Area ---
  const sigY = pageHeight - 50;
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.5);

  doc.line(20, sigY, 90, sigY);
  doc.line(pageWidth - 90, sigY, pageWidth - 20, sigY);

  doc.setFontSize(7);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text("EXPEDIÇÃO / SAÍDA USINA", 55, sigY + 5, { align: "center" });
  doc.text(
    String(orcamento?.nomeCliente || "CLIENTE").toUpperCase(),
    pageWidth - 55,
    sigY + 5,
    { align: "center" },
  );

  doc.setFont("helvetica", "normal");
  doc.setTextColor(
    colors.secondary[0],
    colors.secondary[1],
    colors.secondary[2],
  );
  if (orcamento?.motorista?.nome) {
    doc.text(
      `Motorista: ${String(orcamento.motorista.nome).toUpperCase()}`,
      55,
      sigY + 9,
      { align: "center" },
    );
  }
  doc.text("CONFIRMAÇÃO DE RECEBIMENTO", pageWidth - 55, sigY + 9, {
    align: "center",
  });

  doc.setFontSize(6);
  doc.text("HODÔMETRO / HORA SAÍDA", 55, sigY + 13, { align: "center" });
  doc.text("DATA: ____/____/____ HORA: ____:____", pageWidth - 55, sigY + 13, {
    align: "center",
  });

  // --- Footer Branding ---
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, pageHeight - 15, pageWidth, 15, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const footerText = `Documento gerado em ${new Date().toLocaleString("pt-BR")} | Meu Concreto Intelligence Platform`;
  doc.text(footerText, pageWidth / 2, pageHeight - 6, { align: "center" });

  // Save the PDF
  doc.save(`Venda-${String(venda.id).padStart(5, "0")}.pdf`);

  // Return as Base64 for compatibility
  const output = doc.output("datauristring");
  return output.split(",")[1];
};
