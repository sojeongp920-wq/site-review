/* ==========================================================
   부지검토 리포트 — script.js
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------------------------
     0. 헤더 날짜 표시
  --------------------------------------------------------- */
  const headerDate = document.getElementById("header-date");
  const today = new Date();
  headerDate.textContent = today.toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric"
  }) + " 기준";

  /* ---------------------------------------------------------
     1. 사업유형별 검토사항 체크리스트 데이터
  --------------------------------------------------------- */
  const CHECKLIST_COMMON = [
    "토지 소유권 및 권리관계(저당권·지상권 등) 확인",
    "지구단위계획 수립 여부 및 지침 검토",
    "인허가 소요기간 및 관계부서 사전협의 필요 여부",
    "기반시설부담금·개발부담금 부과 대상 여부"
  ];

  const CHECKLIST_BY_TYPE = {
    "공동주택": [
      "일조권 사선제한 및 동간 이격거리 검토",
      "세대당 법정 주차대수 확보 여부",
      "학교용지부담금 부과 대상 여부",
      "조경면적 및 공개공지 확보 기준",
      "분양가상한제 적용 여부",
      "정비사업(재건축·재개발) 해당 시 초과이익환수제 검토"
    ],
    "오피스텔": [
      "전용면적 85㎡ 이하 여부 및 바닥난방 설치 규정 확인",
      "전용면적별 차등 주차대수 기준 검토",
      "발코니 설치 제한 규정 확인",
      "건축위원회 심의 대상 여부",
      "주거용 오피스텔 취득세·재산세 중과 이슈 검토"
    ],
    "관광숙박시설": [
      "관광진흥법상 등록기준(객실 수, 부대시설 등) 충족 여부",
      "용도지역 내 관광숙박시설 입지 허용 여부",
      "객실당 부설주차장 설치기준 검토",
      "소방시설 및 피난동선 관련 사전 심의 대상 여부",
      "주변 경관·교통영향평가 대상 여부"
    ],
    "업무시설": [
      "연면적당 부설주차장 설치기준 검토",
      "코어 및 전용률 최적화 검토",
      "녹색건축인증·에너지효율등급 의무 대상 여부",
      "오피스 임대 시장 수급 현황 및 경쟁입지 분석",
      "주차장법상 하역공간·자전거보관소 등 부대시설 기준"
    ],
    "코리빙": [
      "준주택·숙박시설 등 용도 분류 및 인허가 근거 법령 확인",
      "최소 실면적 및 공용시설 비율 기준 검토",
      "공유 모빌리티 연계 시 주차대수 완화 적용 가능 여부",
      "다중이용업 관련 소방·피난 규정 검토",
      "위탁운영사 계약구조 및 운영수익 배분 방식 검토"
    ]
  };

  /* 핵심 검토의견용 — 사업유형별 핵심 추가 검토사항 (짧은 구절 2~3개) */
  const KEY_ISSUES_BY_TYPE = {
    "공동주택": ["일조권 사선제한", "세대당 주차기준", "학교용지부담금"],
    "오피스텔": ["전용면적·바닥난방 규정", "전용면적별 주차기준", "건축위원회 심의"],
    "관광숙박시설": ["관광진흥법상 등록기준", "객실당 주차기준", "소방·피난 심의"],
    "업무시설": ["부설주차장 설치기준", "전용률 및 코어 계획", "친환경 인증 의무"],
    "코리빙": ["건축법상 용도분류", "주차기준", "운영형태"]
  };

  /* 높이제한 선택값 → 결과 카드 표시 문구 */
  const HEIGHT_LIMIT_LABELS = {
    "확인필요": "관련 계획 및 법령 추가 확인 필요",
    "없음": "별도 계획상 높이제한 없음 · 기타 건축법상 높이규제 별도 검토"
  };

  /* 높이제한 선택값 → 핵심 검토의견 문장 */
  const HEIGHT_LIMIT_OPINION = {
    "확인필요": "높이제한은 관련 계획 및 법령상 확인이 필요한 사항으로, 인허가 전 별도 확인이 요구됩니다.",
    "없음": "높이제한은 별도 계획상 지정된 바 없으나, 기타 건축법상 높이 규제는 별도 검토가 필요합니다."
  };

  /* ---------------------------------------------------------
     2. 엘리먼트 참조
  --------------------------------------------------------- */
  const viewInput = document.getElementById("view-input");
  const viewResult = document.getElementById("view-result");
  const form = document.getElementById("review-form");
  const btnBack = document.getElementById("btn-back");
  const btnPrint = document.getElementById("btn-print");
  const btnExcel = document.getElementById("btn-excel");

  const districtPlanSelect = document.getElementById("districtPlan");
  const fieldLegalFar = document.getElementById("field-legalFar");
  const groupDistrictFar = document.getElementById("group-districtFar");
  const districtFarHint = document.getElementById("districtFarHint");
  const legalFarInput = document.getElementById("legalFar");
  const baseFarInput = document.getElementById("baseFar");
  const allowedFarInput = document.getElementById("allowedFar");
  const capFarInput = document.getElementById("capFar");
  const appliedFarInput = document.getElementById("appliedFarInput");

  const heightLimitTypeSelect = document.getElementById("heightLimitType");
  const groupHeightLimitValue = document.getElementById("group-heightLimitValue");
  const heightLimitValueInput = document.getElementById("heightLimitValue");

  const opinionText = document.getElementById("opinion-text");
  const metricGrid = document.getElementById("metric-grid");
  const basisTable = document.getElementById("basis-table");
  const checklistGroups = document.getElementById("checklist-groups");
  const checklistSubtitle = document.getElementById("checklist-subtitle");

  const resultAddress = document.getElementById("result-address");
  const resultZoningBadge = document.getElementById("result-zoning-badge");
  const resultTypeBadge = document.getElementById("result-type-badge");

  // 최근 분석 결과를 저장해 두었다가 Excel 다운로드 시 사용
  let currentReport = null;

  /* ---------------------------------------------------------
     3. 지구단위계획구역 여부에 따른 용적률 입력칸 토글
  --------------------------------------------------------- */
  function updateFarFieldVisibility() {
    const isDistrict = districtPlanSelect.value === "해당";

    fieldLegalFar.classList.toggle("is-hidden", isDistrict);
    groupDistrictFar.classList.toggle("is-hidden", !isDistrict);
    districtFarHint.classList.toggle("is-hidden", !isDistrict);

    legalFarInput.required = !isDistrict;
    baseFarInput.required = isDistrict;
    allowedFarInput.required = isDistrict;
    capFarInput.required = isDistrict;
    appliedFarInput.required = isDistrict;
  }

  districtPlanSelect.addEventListener("change", updateFarFieldVisibility);
  updateFarFieldVisibility(); // 초기 상태 반영 (기본값: 해당없음)

  /* ---------------------------------------------------------
     3-1. 높이제한 선택에 따른 직접입력 칸 토글
  --------------------------------------------------------- */
  function updateHeightLimitFieldVisibility() {
    const isDirect = heightLimitTypeSelect.value === "직접입력";

    groupHeightLimitValue.classList.toggle("is-hidden", !isDirect);
    heightLimitValueInput.required = isDirect;

    if (!isDirect) {
      heightLimitValueInput.value = "";
    }
  }

  heightLimitTypeSelect.addEventListener("change", updateHeightLimitFieldVisibility);
  updateHeightLimitFieldVisibility(); // 초기 상태 반영 (기본값: 확인 필요 → 숫자칸 숨김)

  /* ---------------------------------------------------------
     4. 숫자 포맷 유틸
  --------------------------------------------------------- */
  function formatNumber(value, digits = 0) {
    return Number(value).toLocaleString("ko-KR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  /* ---------------------------------------------------------
     5. 렌더링 헬퍼
  --------------------------------------------------------- */
  function renderMetricCard({ label, value, unit, sub, highlight, isText }) {
    const card = document.createElement("div");
    card.className = "metric-card" + (highlight ? " metric-card--highlight" : "");
    const valueClass = "metric-card__value" + (isText ? " metric-card__value--text" : "");
    card.innerHTML = `
      <div class="metric-card__label">${label}</div>
      <div class="${valueClass}">${value}${(unit && !isText) ? `<span class="metric-card__unit">${unit}</span>` : ""}</div>
      ${sub ? `<div class="metric-card__sub">${sub}</div>` : ""}
    `;
    return card;
  }

  function renderBasisRow(label, value, highlight) {
    const row = document.createElement("div");
    row.className = "basis-row" + (highlight ? " basis-row--highlight" : "");
    row.innerHTML = `
      <span class="basis-row__label">${label}</span>
      <span class="basis-row__value">${value}</span>
    `;
    return row;
  }

  function renderChecklistGroup(title, items) {
    const group = document.createElement("div");
    group.className = "checklist-group";

    const heading = document.createElement("h3");
    heading.className = "checklist-group__title";
    heading.textContent = title;
    group.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "checklist-list";

    items.forEach((item, idx) => {
      const li = document.createElement("li");
      const id = `chk-${title}-${idx}`.replace(/\s+/g, "-");
      li.innerHTML = `
        <label class="checklist-item" for="${id}">
          <input type="checkbox" id="${id}">
          <span>${item}</span>
        </label>
      `;
      list.appendChild(li);
    });

    group.appendChild(list);
    return group;
  }

  /* ---------------------------------------------------------
     6. 핵심 검토의견 문장 생성
  --------------------------------------------------------- */
  function buildOpinionParagraphs(d) {
    const paragraphs = [];

    // ① 용도지역 + 지구단위계획구역 + 적용용적률 + 규모 요약
    let farSentence;
    if (d.isDistrict) {
      farSentence = `본 대상지는 ${d.zoning}에 위치하며, 지구단위계획구역에 해당하여 기준용적률 ${formatNumber(d.baseFar, 1)}%, 허용용적률 ${formatNumber(d.allowedFar, 1)}%, 상한용적률 ${formatNumber(d.capFar, 1)}% 중 검토 적용용적률 ${formatNumber(d.appliedFar, 1)}%를 기준으로 검토하였습니다.`;
    } else {
      farSentence = `본 대상지는 ${d.zoning}으로, 지구단위계획구역에 해당하지 않아 법정용적률 ${formatNumber(d.appliedFar, 1)}%를 기준으로 검토하였습니다.`;
    }
    const scaleSentence = `대지면적 ${formatNumber(d.landArea, 2)}㎡를 기준으로 최대 건축면적은 약 ${formatNumber(d.maxBuildingArea, 2)}㎡, 개략적인 용적률 산정 연면적은 약 ${formatNumber(d.expectedFloorArea, 2)}㎡로 산정됩니다.`;
    paragraphs.push(`${farSentence} ${scaleSentence}`);

    // ② 높이제한 검토 결과
    let heightSentence;
    if (d.heightLimitType === "직접입력") {
      heightSentence = `높이제한은 ${formatNumber(d.heightLimitValue, 1)}m로 확인되며, 해당 기준 내에서 개발 규모 계획이 필요합니다.`;
    } else {
      heightSentence = HEIGHT_LIMIT_OPINION[d.heightLimitType];
    }
    paragraphs.push(heightSentence);

    // ③ 사업유형별 핵심 추가 검토사항
    const keyIssues = KEY_ISSUES_BY_TYPE[d.projectType] || [];
    if (keyIssues.length > 0) {
      paragraphs.push(`${d.projectType} 개발 시 ${keyIssues.join(", ")} 등에 대한 추가 검토가 필요합니다.`);
    }

    return paragraphs;
  }

  /* ---------------------------------------------------------
     7. 폼 제출 → 계산 → 결과 화면 렌더링
  --------------------------------------------------------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const isDistrict = districtPlanSelect.value === "해당";
    const heightLimitType = heightLimitTypeSelect.value; // "확인필요" | "없음" | "직접입력"
    const isHeightDirect = heightLimitType === "직접입력";

    const raw = {
      address: document.getElementById("address").value.trim(),
      landArea: parseFloat(document.getElementById("landArea").value),
      zoning: document.getElementById("zoning").value,
      projectType: document.getElementById("projectType").value,
      districtPlan: districtPlanSelect.value,
      coverageRatio: parseFloat(document.getElementById("coverageRatio").value),
      heightLimitType: heightLimitType,
      heightLimitValue: isHeightDirect ? parseFloat(heightLimitValueInput.value) : null,
      legalFar: isDistrict ? null : parseFloat(legalFarInput.value),
      baseFar: isDistrict ? parseFloat(baseFarInput.value) : null,
      allowedFar: isDistrict ? parseFloat(allowedFarInput.value) : null,
      capFar: isDistrict ? parseFloat(capFarInput.value) : null,
      reviewAppliedFar: isDistrict ? parseFloat(appliedFarInput.value) : null
    };

    // 필수 항목 검증 (지구단위계획 여부 / 높이제한 선택에 따라 관련 필드만 검사)
    const requiredCommon = [raw.address, raw.landArea, raw.zoning, raw.projectType, raw.coverageRatio];
    const requiredFar = isDistrict
      ? [raw.baseFar, raw.allowedFar, raw.capFar, raw.reviewAppliedFar]
      : [raw.legalFar];
    const requiredHeight = isHeightDirect ? [raw.heightLimitValue] : [];

    const isInvalid = requiredCommon.some(v => v === "" || v === undefined || Number.isNaN(v)) ||
                       requiredFar.some(v => v === "" || v === undefined || Number.isNaN(v)) ||
                       requiredHeight.some(v => v === "" || v === undefined || Number.isNaN(v));

    if (isInvalid) {
      alert("모든 항목을 입력해 주세요.");
      return;
    }

    // --- 계산 로직 ----------------------------------------------------
    const appliedFar = isDistrict ? raw.reviewAppliedFar : raw.legalFar;
    const maxBuildingArea = raw.landArea * (raw.coverageRatio / 100);
    const expectedFloorArea = raw.landArea * (appliedFar / 100);
    const heightLimitDisplay = isHeightDirect
      ? `${formatNumber(raw.heightLimitValue, 1)}m`
      : HEIGHT_LIMIT_LABELS[raw.heightLimitType];

    const d = {
      ...raw,
      isDistrict,
      appliedFar,
      maxBuildingArea,
      expectedFloorArea,
      heightLimitDisplay
    };

    // --- 결과 헤더 ------------------------------------------------------
    resultAddress.textContent = d.address;
    resultZoningBadge.textContent = d.zoning;
    resultTypeBadge.textContent = d.projectType;

    // --- 핵심 검토의견 ---------------------------------------------------
    const opinionParagraphs = buildOpinionParagraphs(d);
    opinionText.innerHTML = opinionParagraphs.map(p => `<p>${p}</p>`).join("");

    // --- 용적률 산정 기준표 ---------------------------------------------
    basisTable.innerHTML = "";
    basisTable.appendChild(renderBasisRow("용도지역", d.zoning));
    basisTable.appendChild(renderBasisRow("지구단위계획구역 여부", d.districtPlan === "해당" ? "해당" : "해당 없음"));

    if (isDistrict) {
      basisTable.appendChild(renderBasisRow("기준용적률", `${formatNumber(d.baseFar, 1)} %`));
      basisTable.appendChild(renderBasisRow("허용용적률", `${formatNumber(d.allowedFar, 1)} %`));
      basisTable.appendChild(renderBasisRow("상한용적률", `${formatNumber(d.capFar, 1)} %`));
    } else {
      basisTable.appendChild(renderBasisRow("법정용적률", `${formatNumber(d.legalFar, 1)} %`));
    }

    basisTable.appendChild(renderBasisRow("검토 적용용적률", `${formatNumber(appliedFar, 1)} %`, true));

    // --- 지표 카드 --------------------------------------------------------
    metricGrid.innerHTML = "";
    const cards = [
      { label: "대지면적", value: formatNumber(d.landArea, 2), unit: "㎡" },
      { label: "건폐율", value: formatNumber(d.coverageRatio, 1), unit: "%" },
      {
        label: "검토 적용용적률",
        value: formatNumber(appliedFar, 1),
        unit: "%",
        sub: isDistrict ? "지구단위계획구역 — 검토 적용값" : "법정용적률 적용",
        highlight: true
      },
      { label: "최대 건축면적", value: formatNumber(maxBuildingArea, 2), unit: "㎡", sub: "대지면적 × 건폐율 ÷ 100" },
      { label: "예상 용적률 산정 연면적", value: formatNumber(expectedFloorArea, 2), unit: "㎡", sub: "대지면적 × 적용용적률 ÷ 100", highlight: true },
      { label: "높이제한", value: heightLimitDisplay, isText: true }
    ];
    cards.forEach(c => metricGrid.appendChild(renderMetricCard(c)));

    // --- 체크리스트 --------------------------------------------------------
    checklistSubtitle.textContent = `'${d.projectType}' 사업유형 기준으로 자동 구성된 검토 항목입니다.`;
    checklistGroups.innerHTML = "";
    const typeChecklist = CHECKLIST_BY_TYPE[d.projectType] || [];
    checklistGroups.appendChild(renderChecklistGroup("공통 검토사항", CHECKLIST_COMMON));
    checklistGroups.appendChild(renderChecklistGroup(`${d.projectType} 특화 검토사항`, typeChecklist));

    // --- Excel 다운로드용 데이터 저장 ---------------------------------------
    currentReport = { ...d, opinionParagraphs, typeChecklist };

    // --- 화면 전환 --------------------------------------------------------
    viewInput.classList.add("view--hidden");
    viewResult.classList.remove("view--hidden");
    window.scrollTo({ top: 0 });
  });

  /* ---------------------------------------------------------
     8. 뒤로가기 / 인쇄
  --------------------------------------------------------- */
  btnBack.addEventListener("click", () => {
    viewResult.classList.add("view--hidden");
    viewInput.classList.remove("view--hidden");
    window.scrollTo({ top: 0 });
  });

  btnPrint.addEventListener("click", () => {
    window.print();
  });

  /* ---------------------------------------------------------
     9. Excel 다운로드 (외부 서버·라이브러리 없이 동작)
     - HTML 표 형태로 데이터를 구성한 뒤, Excel이 인식하는
       'application/vnd.ms-excel' 형식의 파일(.xls)로 내려받습니다.
  --------------------------------------------------------- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function buildExcelHtml(d) {
    const rows = [];
    const addRow = (label, value) => {
      rows.push(`<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`);
    };

    addRow("대상지 주소", d.address);
    addRow("대지면적(㎡)", formatNumber(d.landArea, 2));
    addRow("용도지역", d.zoning);
    addRow("사업유형", d.projectType);
    addRow("지구단위계획구역 여부", d.districtPlan === "해당" ? "해당" : "해당 없음");
    addRow("건폐율(%)", formatNumber(d.coverageRatio, 1));

    if (d.isDistrict) {
      addRow("기준용적률(%)", formatNumber(d.baseFar, 1));
      addRow("허용용적률(%)", formatNumber(d.allowedFar, 1));
      addRow("상한용적률(%)", formatNumber(d.capFar, 1));
    } else {
      addRow("법정용적률(%)", formatNumber(d.legalFar, 1));
    }

    addRow("검토 적용용적률(%)", formatNumber(d.appliedFar, 1));
    addRow("최대 건축면적(㎡)", formatNumber(d.maxBuildingArea, 2));
    addRow("예상 용적률 산정 연면적(㎡)", formatNumber(d.expectedFloorArea, 2));
    addRow("높이제한", d.heightLimitDisplay);
    addRow("핵심 검토의견", d.opinionParagraphs.join(" "));

    // 체크리스트 (공통 + 사업유형별) — 체크 여부는 다운로드 시점 화면 상태를 반영
    const checkedItems = [];
    document.querySelectorAll("#checklist-groups .checklist-item").forEach(label => {
      const checked = label.querySelector('input[type="checkbox"]').checked;
      const text = label.querySelector("span").textContent;
      checkedItems.push(`${checked ? "[V]" : "[ ]"} ${text}`);
    });
    addRow("주요 검토사항 체크리스트", checkedItems.join(" / "));

    return `
      <html>
      <head><meta charset="UTF-8"></head>
      <body>
        <table border="1">
          <tr><th colspan="2" style="background:#0b2545;color:#ffffff;">부지검토 리포트 — 개발 가능성 1차 검토</th></tr>
          ${rows.join("")}
        </table>
      </body>
      </html>
    `;
  }

  btnExcel.addEventListener("click", () => {
    if (!currentReport) return;

    const html = buildExcelHtml(currentReport);
    // 한글 깨짐 방지를 위한 BOM 추가
    const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8;" });

    const fileNameSafe = (currentReport.address || "부지검토결과").replace(/[\\/:*?"<>|]/g, "").slice(0, 40);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `부지검토결과_${fileNameSafe}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });

});
const reviewBtn = document.getElementById("reviewBtn");
const reviewResult = document.getElementById("review-result");

reviewBtn.addEventListener("click", () => {

  // 입력값 가져오기
  const landArea = Number(document.getElementById("landArea").value);
  const coverageRatio = Number(document.getElementById("coverageRatio").value);
  const legalFar = Number(document.getElementById("legalFar").value);

  // 자동 계산
  const buildingArea = landArea * (coverageRatio / 100);
  const floorArea = landArea * (legalFar / 100);
const landAreaPy = landArea / 3.3058;

const estimatedFloors = buildingArea > 0
  ? Math.ceil(floorArea / buildingArea)
  : 0;
  // 결과 화면에 표시
  document.getElementById("resultArea").textContent =
    landArea.toLocaleString();

  document.getElementById("resultBuildingArea").textContent =
    buildingArea.toLocaleString();

  document.getElementById("resultFloorArea").textContent =
    floorArea.toLocaleString();
    document.getElementById("resultCoverageRatio").textContent =
  coverageRatio.toLocaleString();

document.getElementById("resultLegalFar").textContent =
  legalFar.toLocaleString();
document.getElementById("resultAreaPy").textContent =
  landAreaPy.toLocaleString(undefined, {
    maximumFractionDigits: 1
  });

document.getElementById("resultFloors").textContent =
  estimatedFloors;

document.getElementById("resultComment").textContent =
  `법정 용적률 ${legalFar}% 기준 용적률 산정 연면적은 약 ${floorArea.toLocaleString()}㎡이며, 건폐율 ${coverageRatio}%를 단순 적용할 경우 약 ${estimatedFloors}개 층 규모로 검토할 수 있습니다.`;
  // STEP 2 보여주기
  reviewResult.classList.remove("view-hidden");
});
const addressSearchBtn = document.getElementById("addressSearchBtn");

addressSearchBtn.addEventListener("click", () => {
  const address = document.getElementById("address").value;
  const result = document.getElementById("addressSearchResult");

  if (!address.trim()) {
    alert("주소를 입력해주세요.");
    return;
  }

  result.innerHTML = `
    <strong>대상지 입력 완료</strong><br>
    주소: ${address}<br>
    ※ 용도지역을 선택하면 기본 건폐율·용적률이 자동 반영됩니다.
  `;
});