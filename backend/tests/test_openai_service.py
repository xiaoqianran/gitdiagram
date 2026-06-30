from app.services.graph_service import DiagramGraph
from app.services.openai_service import (
    DEFAULT_ATLAS_BASE_URL,
    OpenAIService,
    StructuredOutputParseError,
)


def test_resolve_api_key_reads_atlas_env(monkeypatch):
    monkeypatch.setenv("ATLAS_API_KEY", "apikey-test")

    service = OpenAIService()

    assert service._resolve_api_key("atlas") == "apikey-test"


def test_create_client_uses_atlas_base_url(monkeypatch):
    captured = {}

    class FakeAsyncOpenAI:
        def __init__(self, **kwargs):
            captured.update(kwargs)

    monkeypatch.setattr("app.services.openai_service.AsyncOpenAI", FakeAsyncOpenAI)
    monkeypatch.delenv("ATLAS_BASE_URL", raising=False)

    OpenAIService._create_client("atlas", "apikey-test")

    assert captured["api_key"] == "apikey-test"
    assert captured["base_url"] == DEFAULT_ATLAS_BASE_URL


def test_coerce_json_text_extracts_object_from_markdown():
    raw = """Exploring key backend architecture.
```json
{"groups": [], "nodes": [{"id": "api", "label": "API", "type": "service", "description": null, "groupId": null, "path": null, "shape": null}], "edges": []}
```"""

    coerced = OpenAIService._coerce_json_text(raw)

    assert coerced.startswith("{")
    assert coerced.endswith("}")


def test_parse_structured_model_accepts_wrapped_json():
    raw = """Exploring key backend architecture and data flows.
{
  "groups": [],
  "nodes": [
    {
      "id": "api",
      "label": "API",
      "type": "service",
      "description": null,
      "groupId": null,
      "path": null,
      "shape": null
    }
  ],
  "edges": []
}"""

    parsed = OpenAIService._parse_structured_model(raw, DiagramGraph)

    assert parsed.nodes[0].id == "api"


def test_parse_structured_model_raises_parse_error_for_prose_only():
    try:
        OpenAIService._parse_structured_model(
            "Exploring key backend architecture and data flows.",
            DiagramGraph,
        )
    except StructuredOutputParseError as exc:
        assert "Exploring key backend" in exc.raw_text
    else:
        raise AssertionError("Expected StructuredOutputParseError")
