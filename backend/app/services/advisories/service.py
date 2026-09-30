import datetime
import uuid
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import AdvisoryDraftModel
from app.schemas.schemas import AdvisoryDraftRequest, AdvisoryResponse, AdvisoryUpdateRequest, AdvisoryApproveRequest
from app.services.weather.service import weather_service
from app.services.infrastructure.service import infrastructure_service
from app.services.gemini.service import gemini_copilot_service

# Pre-crafted evidence-grounded templates for English and Telugu
ADVISORY_TEMPLATES = {
    "general_public": {
        "en": {
            "title": "PRE-LANDFALL PREPAREDNESS BULLETIN: Severe Cyclonic Storm Varun",
            "content": (
                "EMERGENCY PREPAREDNESS NOTICE FOR COASTAL RESIDENTS\n\n"
                "Issued for: Coastal Andhra Pradesh (Kakinada, Konaseema, West Godavari, Krishna, Bapatla Districts)\n"
                "Forecast Status: Landfall approach projected with sustained winds of 130-155 km/h and intense precipitation (285 mm/24h).\n\n"
                "KEY PROTECTIVE INSTRUCTIONS:\n"
                "1. If residing in low-lying thatched or asbestos-roofed structures within 3 km of the sea, relocate promptly to designated APSDMA Multipurpose Cyclone Shelters.\n"
                "2. Store clean drinking water for a minimum of 72 hours, non-perishable food, prescription medicines, emergency torchlights, and fully charged power banks.\n"
                "3. Secure outdoor loose items, window shutters, and solar rooftop installations.\n"
                "4. Strictly avoid venturing near sea beaches, coastal embankments, or submerged causeways.\n"
                "5. Follow only verified district administration bulletins via All India Radio and official APSDMA channels."
            ),
            "evidence": "IMD track projection 155 km/h winds; 285mm 24h rainfall; NASA SRTM <3m coastal elevation screening.",
            "uncertainty": "Exact landfall point subject to ±45km track cone uncertainty."
        },
        "te": {
            "title": "తీవ్ర తుపాను 'వరుణ్' ముందస్తు రక్షణ హెచ్చరిక మరియు మార్గదర్శకాలు",
            "content": (
                "ఆంధ్రప్రదేశ్ తీరప్రాంత ప్రజలకు అత్యవసర సూచనలు:\n\n"
                "ప్రభావిత ప్రాంతాలు: కాకినాడ, కోనసీమ, పశ్చిమ గోదావరి, కృష్ణా, బాపట్ల జిల్లాలు.\n"
                "వాతావరణ అంచనా: గంటకు 130 నుండి 155 కి.మీ వేగంతో బలమైన గాలులు, 285 మి.మీ భారీ వర్షపాతం నమోదయ్యే అవకాశం ఉంది.\n\n"
                "ముఖ్యమైన రక్షణ చర్యలు:\n"
                "1. తీరానికి 3 కి.మీ పరిధిలోని మట్టి/రేకుల ఇళ్లలో నివసించే ప్రజలు తక్షణమే సమీపంలోని బహుళార్ధసాధక తుపాను పునరావాస కేంద్రాలకు (APSDMA Shelters) చేరుకోవాలి.\n"
                "2. కనీసం 3 రోజులకు సరిపడా తాగునీరు, పొడి ఆహారం, అత్యవసర మందులు మరియు టార్చ్‌లైట్లను సిద్ధం చేసుకోండి.\n"
                "3. సముద్ర తీరాలకు, వాగులకు, వరద నీరు ప్రవహించే కాజ్‌వేలకు ఎట్టి పరిస్థితుల్లోనూ వెళ్లరాదు.\n"
                "4. పుకార్లను నమ్మవద్దు; కేవలం జిల్లా కలెక్టర్ మరియు విపత్తు నిర్వహణ శాఖ అధికారిక ప్రకటనలను మాత్రమే అనుసరించండి."
            ),
            "evidence": "ఐఎండీ సూచనలు మరియు ఉపగ్రహ ఆధారిత వరద ప్రమాద విశ్లేషణ.",
            "uncertainty": "తుపాను గమనం మరియు తీరం దాటే స్థానంలో ±45 కి.మీ వ్యత్యాసం ఉండవచ్చు."
        }
    },
    "fishermen": {
        "en": {
            "title": "MARINE HAZARD & FISHERMEN ADVISORY: TOTAL SUSPENSION OF SEA OPERATIONS",
            "content": (
                "HIGH SEAS WARNING FOR BAY OF BENGAL (COASTAL ANDHRA PRADESH)\n\n"
                "Category: Very Severe Marine Roughness & Gale Winds (130-155 km/h, Gusting to 175 km/h)\n\n"
                "DIRECTIVES:\n"
                "1. Total ban on mechanized, motorized, and traditional fishing boats venturing into deep sea or coastal waters.\n"
                "2. All craft currently at sea along Kakinada, Machilipatnam, and Visakhapatnam coastal zones must immediately return to nearest designated fishing harbors or berths.\n"
                "3. Secure fishing gear, nets, and outboard motors at elevated onshore storage points above the 4-meter surge line.\n"
                "4. Port signals warning flag No. 9 hoisted at Kakinada and Machilipatnam ports."
            ),
            "evidence": "Wave height forecast 3.5 - 4.8 meters; gale wind speed >130 km/h.",
            "uncertainty": "Offshore squall intensity and localized sea-surface surge heights."
        },
        "te": {
            "title": "మత్స్యకారులకు అత్యవసర సముద్ర హెచ్చరిక: వేట పూర్తిగా నిషేధం",
            "content": (
                "బంగాళాఖాతంలో తీవ్ర తుపాను ముప్పు:\n\n"
                "హెచ్చరిక స్థాయి: ప్రమాదకర సముద్ర అలల ఉధృతి (గంటకు 130-155 కి.మీ వేగంతో బలమైన గాలులు).\n\n"
                "ఆదేశాలు:\n"
                "1. సముద్రంలోకి చేపల వేటకు వెళ్లడం పూర్తిగా నిషేధించబడింది.\n"
                "2. ఇప్పటికే సముద్రంలో ఉన్న బోట్లు వెంటనే సమీప ఫిషింగ్ హార్బర్ లేదా సురక్షిత ప్రాంతాలకు చేరుకోవాలి.\n"
                "3. బోట్లు, వలలు మరియు యంత్రాలను సముద్రపు నీరు చేరని ఎత్తైన ప్రదేశాలలో భద్రపరుచుకోవాలి.\n"
                "4. కాకినాడ, మచిలీపట్నం రేవులలో ప్రమాద హెచ్చరిక నంబర్ 9 ఎగురవేయబడింది."
            ),
            "evidence": "సముద్రపు అలల ఎత్తు 4 మీటర్లు మించే అవకాశం ఉన్నందున.",
            "uncertainty": "తీరప్రాంత గాలుల తీవ్రతలో స్వల్ప మార్పులు సంభవించవచ్చు."
        }
    },
    "collectors_responders": {
        "en": {
            "title": "DISTRICT COLLECTOR & EMERGENCY FIRST RESPONDER OPERATIONAL BRIEFING",
            "content": (
                "INCIDENT COMMAND ACTION MEMORANDUM\n\n"
                "Target Districts: Visakhapatnam, Kakinada, East Godavari, Konaseema, West Godavari, Krishna, Bapatla\n\n"
                "ACTION PROTOCOLS:\n"
                "1. ACTIVATE DISTRICT EOC: Establish 24x7 Emergency Operations Centers with dedicated satellite communication links.\n"
                "2. SHELTER COMMISSIONS: Inspect and energize all designated Multipurpose Cyclone Shelters. Confirm stock of generator fuel, water purification tablets, and baby food.\n"
                "3. PRE-POSITION NDRF/SDRF: Deploy State & National Disaster Response Force teams along vulnerable mandal clusters in Kakinada and Machilipatnam.\n"
                "4. HEALTH FACILITY RESILIENCE: Ensure King George Hospital (Visakhapatnam) and GGH Kakinada have backup oxygen plants and elevated power panels operational.\n"
                "5. ROAD CLEARANCE TEAMS: Pre-position tree-cutting crews and JCB excavators along NH-16 Kakinada corridor to ensure emergency ambulance access."
            ),
            "evidence": "12 critical health and shelter facilities screened; 3 highway segments flagged for potential disruption.",
            "uncertainty": "Inland riverine tributary cresting timing dependent on Godavari upper catchment rainfall."
        },
        "te": {
            "title": "జిల్లా కలెక్టర్లు & విపత్తు నిర్వహణ బృందాలకు కార్యాచరణ ఉత్తర్వులు",
            "content": (
                "అధికారిక ఆదేశాల పత్రం:\n\n"
                "లక్ష్యిత ప్రాంతాలు: కాకినాడ, కోనసీమ, కృష్ణా, బాపట్ల మరియు విశాఖపట్నం జిల్లాలు.\n\n"
                "అమలు చేయాల్సిన చర్యలు:\n"
                "1. 24 గంటల ఎమర్జెన్సీ ఆపరేషన్స్ సెంటర్లు (EOC) పూర్తిస్థాయిలో పనిచేసేలా చూడండి.\n"
                "2. తుపాను షెల్టర్లలో మంచినీరు, ఆహారం, మందులు మరియు విద్యుత్ బ్యాకప్ జనరేటర్లను సిద్ధం చేయండి.\n"
                "3. తీరప్రాంత మండలాల్లో ఎన్డీఆర్ఎఫ్ (NDRF) మరియు ఎస్డీఆర్ఎఫ్ (SDRF) రక్షణ బృందాలను రంగంలోకి దించండి.\n"
                "4. ప్రధాన ఆసుపత్రులలో అత్యవసర చికిత్స విభాగాలు నిరంతరాయంగా పనిచేసేలా ఏర్పాట్లు చేయండి.\n"
                "5. ఎన్‌హెచ్-16 మరియు ప్రధాన రహదారులపై చెట్లు కూలిపోతే వెంటనే తొలగించడానికి జేసీబీ, గ్యాస్ కట్టర్ బృందాలను సిద్ధంగా ఉంచండి."
            ),
            "evidence": "విపత్తు విశ్లేషణ మరియు అత్యవసర మౌలిక వసతుల స్థితిగతులు.",
            "uncertainty": "స్థానిక కాలువల నీటిమట్టం పెరిగే వేగంపై నిరంతర పర్యవేక్షణ అవసరం."
        }
    },
    "port_operators": {
        "en": {
            "title": "PORT & MARITIME INFRASTRUCTURE ADVISORY: Visakhapatnam & Kakinada Deepwater Ports",
            "content": (
                "OPERATIONAL SAFETY DIRECTIVE FOR PORT TERMINALS & OFFSHORE PLATFORMS\n\n"
                "1. Cease all crane and container lifting operations when sustained wind gusts exceed 65 km/h.\n"
                "2. Fasten all gantry cranes with storm anchors and rail clamps.\n"
                "3. Ensure all moored vessels either cast off to open deep anchorage or reinforce moorings with double bitts.\n"
                "4. Shut down hazardous chemical transfer lines and purge oil manifolds.\n"
                "5. Maintain harbor tugs on standby with marine pilots on 15-minute response readiness."
            ),
            "evidence": "Peak gusts 155 km/h; coastal wave swell >4.0m.",
            "uncertainty": "Tidal timing synchronization with peak astronomical high tide."
        },
        "te": {
            "title": "ఓడరేవు మరియు పారిశ్రామిక మౌలిక వసతుల అత్యవసర మార్గదర్శకాలు",
            "content": (
                "విశాఖపట్నం మరియు కాకినాడ పోర్టుల నిర్వహణ కొరకు ఆదేశాలు:\n\n"
                "1. తీరంలో గాలుల వేగం పెరిగినప్పుడు క్రేన్లు మరియు కంటైనర్ లిఫ్టింగ్ పనులను నిలిపివేయాలి.\n"
                "2. ఓడరేవులోని క్రేన్లను తుపాను లాక్‌లతో భద్రపరచాలి.\n"
                "3. రేవులో లంగరు వేసిన నౌకలను సురక్షిత ప్రాంతాలకు లేదా లోతైన సముద్రానికి తరలించాలి.\n"
                "4. రసాయన మరియు చమురు పైప్‌లైన్ల సరఫరాను నిలిపివేసి భద్రతా తనిఖీలు చేపట్టాలి.\n"
                "5. అత్యవసర సహాయం కొరకు టగ్ బోట్లను సిద్ధంగా ఉంచాలి."
            ),
            "evidence": "తీరప్రాంత అలల తీవ్రత మరియు పవన వేగ విశ్లేషణ ఆధారంగా.",
            "uncertainty": "హై-టైడ్ సమయంతో తుపాను ప్రభావం కలిసే తీరును బట్టి మార్పులు ఉండవచ్చు."
        }
    }
}

class AdvisoryService:
    def create_draft(self, request: AdvisoryDraftRequest, db: Optional[Session] = None) -> AdvisoryResponse:
        """Generates a structured draft from verified scenario evidence.
        If Gemini API is configured and available, uses it to generate AI‑powered advisory content.
        Otherwise falls back to the deterministic template.
        """
        audience = request.audience if request.audience in ADVISORY_TEMPLATES else "general_public"
        lang = request.language if request.language in ("en", "te") else "en"
        tpl = ADVISORY_TEMPLATES[audience][lang]

        draft_id = f"adv_{uuid.uuid4().hex[:8]}"
        now_dt = datetime.datetime.now(datetime.UTC)
        now_iso = now_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        # Default template values
        title = tpl["title"]
        content = tpl["content"]
        evidence = tpl["evidence"]
        uncertainty = tpl["uncertainty"]
        is_ai_generated = False

        # Attempt Gemini generation if client is ready
        if gemini_copilot_service.client:
            try:
                query = (
                    f"Generate a concise advisory for audience '{request.audience}' "
                    f"in language '{request.language}'. Include a situation summary, "
                    "key findings, suggested actions, and note any uncertainties. "
                    "Do not invent measurements or official orders."
                )
                ai_resp = gemini_copilot_service.analyze_query(
                    query=query,
                    scenario_id=request.scenario_id,
                )
                # Map Gemini response fields to advisory fields
                title = f"Advisory for {request.audience.replace('_', ' ').title()}"
                parts = [ai_resp.summary]
                if getattr(ai_resp, "findings", None):
                    parts.append("\nFindings:\n")
                    for f in ai_resp.findings:
                        parts.append(f"- {f.title}: {f.detail}\n")
                if getattr(ai_resp, "suggested_actions", None):
                    parts.append("\nSuggested Actions:\n")
                    for act in ai_resp.suggested_actions:
                        parts.append(f"* {act}\n")
                if getattr(ai_resp, "uncertainties", None):
                    parts.append("\nUncertainties:\n")
                    for u in ai_resp.uncertainties:
                        parts.append(f"- {u}\n")
                content = "".join(parts)
                evidence = ", ".join(getattr(ai_resp, "cited_sources", []))
                uncertainties_list = getattr(ai_resp, "uncertainties", [])
                uncertainties_list.append("AI-generated draft — requires validation and authorization by the appropriate disaster-management authority.")
                uncertainty = "; ".join(uncertainties_list)
                is_ai_generated = True
            except Exception as e:
                logging.warning(f"Gemini advisory generation failed: {e}. Using template fallback.")
                uncertainty += " | Draft — requires validation and authorization by the appropriate disaster-management authority."
        else:
            uncertainty += " | Draft — requires validation and authorization by the appropriate disaster-management authority."

        draft_obj = AdvisoryDraftModel(
            id=draft_id,
            scenario_id=request.scenario_id,
            region_id=request.region_id,
            audience=audience,
            language=lang,
            title=title,
            content=content,
            evidence_summary=evidence,
            uncertainty_statement=uncertainty,
            status="draft",
            created_at=now_dt,
            updated_at=now_dt,
        )

        if db:
            db.add(draft_obj)
            db.commit()
            db.refresh(draft_obj)

        return AdvisoryResponse(
            id=draft_id,
            scenario_id=request.scenario_id,
            region_id=request.region_id,
            audience=audience,
            language=lang,
            title=title,
            content=content,
            evidence_summary=evidence,
            uncertainty_statement=uncertainty,
            status="draft",
            is_ai_generated=is_ai_generated,
            approved_by=None,
            approved_at=None,
            review_notes=None,
            created_at=now_iso,
            updated_at=now_iso,
        )

    def get_all_drafts(self, db: Session) -> List[AdvisoryResponse]:
        drafts = db.query(AdvisoryDraftModel).order_by(AdvisoryDraftModel.created_at.desc()).all()
        return [
            AdvisoryResponse(
                id=d.id,
                scenario_id=d.scenario_id,
                region_id=d.region_id,
                audience=d.audience,
                language=d.language,
                title=d.title,
                content=d.content,
                evidence_summary=d.evidence_summary,
                uncertainty_statement=d.uncertainty_statement,
                status=d.status,
                approved_by=d.approved_by,
                approved_at=d.approved_at.isoformat() + "Z" if d.approved_at else None,
                review_notes=d.review_notes,
                created_at=d.created_at.isoformat() + "Z" if d.created_at else "",
                updated_at=d.updated_at.isoformat() + "Z" if d.updated_at else ""
            )
            for d in drafts
        ]

    def update_draft(self, advisory_id: str, update_req: AdvisoryUpdateRequest, db: Session) -> Optional[AdvisoryResponse]:
        draft = db.query(AdvisoryDraftModel).filter(AdvisoryDraftModel.id == advisory_id).first()
        if not draft:
            return None
        draft.title = update_req.title
        draft.content = update_req.content
        if update_req.review_notes:
            draft.review_notes = update_req.review_notes
        draft.updated_at = datetime.datetime.now(datetime.UTC)
        db.commit()
        db.refresh(draft)

        return AdvisoryResponse(
            id=draft.id,
            scenario_id=draft.scenario_id,
            region_id=draft.region_id,
            audience=draft.audience,
            language=draft.language,
            title=draft.title,
            content=draft.content,
            evidence_summary=draft.evidence_summary,
            uncertainty_statement=draft.uncertainty_statement,
            status=draft.status,
            approved_by=draft.approved_by,
            approved_at=draft.approved_at.isoformat() + "Z" if draft.approved_at else None,
            review_notes=draft.review_notes,
            created_at=draft.created_at.isoformat() + "Z",
            updated_at=draft.updated_at.isoformat() + "Z"
        )

    def approve_draft(self, advisory_id: str, approve_req: AdvisoryApproveRequest, db: Session) -> Optional[AdvisoryResponse]:
        draft = db.query(AdvisoryDraftModel).filter(AdvisoryDraftModel.id == advisory_id).first()
        if not draft:
            return None
        draft.status = "approved"
        draft.approved_by = f"{approve_req.reviewer_name} ({approve_req.official_title})"
        draft.approved_at = datetime.datetime.now(datetime.UTC)
        if approve_req.review_notes:
            draft.review_notes = approve_req.review_notes
        draft.updated_at = datetime.datetime.now(datetime.UTC)
        db.commit()
        db.refresh(draft)

        return AdvisoryResponse(
            id=draft.id,
            scenario_id=draft.scenario_id,
            region_id=draft.region_id,
            audience=draft.audience,
            language=draft.language,
            title=draft.title,
            content=draft.content,
            evidence_summary=draft.evidence_summary,
            uncertainty_statement=draft.uncertainty_statement,
            status=draft.status,
            approved_by=draft.approved_by,
            approved_at=draft.approved_at.isoformat() + "Z",
            review_notes=draft.review_notes,
            created_at=draft.created_at.isoformat() + "Z",
            updated_at=draft.updated_at.isoformat() + "Z"
        )

advisory_service = AdvisoryService()
