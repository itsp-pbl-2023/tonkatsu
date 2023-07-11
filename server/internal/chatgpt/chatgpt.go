package chatgpt

import (
	"bytes"
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"
	"strings"
)

type OpenaiRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type OpenaiResponse struct {
	ID      string   `json:"id"`
	Object  string   `json:"object"`
	Created int      `json:"created"`
	Choices []Choice `json:"choices"`
	Usages  Usage    `json:"usage"`
}

type Choice struct {
	Index        int     `json:"index"`
	Messages     Message `json:"message"`
	FinishReason string  `json:"finish_reason"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

func CallChatGPT(message string) string {
	apiKey := os.Getenv(("OPENAI_API_KEY"))

	if apiKey == "" {
		stub := "1. フライされた豚肉の切り身が主要な要素であり、食べる際にはサクサクとした食感が楽しめる。\n2. 豚肉は、衣と呼ばれる層に包まれており、これによって豚肉の柔らかさが保たれる。\n3. 豚肉の外側は、衣の色とりどりの美しい表面で覆われており、食欲をそそる見た目となっている。\n4. 豚肉の香りや食材の風味が引き立てられ、一緒に添えられるソースやキャベツとの相性も良い。\n5. 一般的には、ごはんや味噌汁といった伝統的な料理と組み合わせて食べられることが多い。"
		return stub
	}
	var messages []Message
	messages = append(messages, Message{
		Role:    "user",
		Content: message,
	})

	requestBody := OpenaiRequest{
		Model:    "gpt-3.5-turbo",
		Messages: messages,
	}

	requestJSON, _ := json.Marshal(requestBody)

	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(requestJSON))
	if err != nil {
		panic(err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			panic(err)
		}
	}(resp.Body)

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}

	var response OpenaiResponse
	err = json.Unmarshal(body, &response)
	if err != nil {
		println("Error: ", err.Error())
		return "FAILED"
	}

	messages = append(messages, Message{
		Role:    "assistant",
		Content: response.Choices[0].Messages.Content,
	})

	return response.Choices[0].Messages.Content
}

func AskChatGPT(keyword string, gamemode string) []string {
	var prompt string
	switch gamemode {
	case "normal":
		prompt = "[[KEYWORD]]に関する説明を5箇条で書いてください。日本語で書いてください。極めて抽象的に記述してください。[[KEYWORD]]という言葉は絶対に使わないでください。"

	case "easy":
		prompt = "[[KEYWORD]]に関する説明を5箇条で書いてください。日本語で書いてください。[[KEYWORD]]という言葉は絶対に使わないでください。"
	case "hard":
		prompt = "[[KEYWORD]]に関する説明を5箇条で書いてください。日本語で書いてください。[[KEYWORD]]という言葉は絶対に使わないでください。分かりにくく書いてください。"
	case "chinese":
		prompt = "[[KEYWORD]]に関する説明を5箇条で書いてください。中国語で書いてください。[[KEYWORD]]という言葉は絶対に使わないでください。"
	case "english":
		prompt = "[[KEYWORD]]に関する説明を5箇条で書いてください。英語で書いてください。[[KEYWORD]]という言葉は絶対に使わないでください。"
	default:
		prompt = "[[KEYWORD]]に関する説明を5箇条で書いてください。日本語で書いてください。極めて抽象的に記述してください。[[KEYWORD]]という言葉は絶対に使わないでください。"
	}
	prompt = strings.Replace(prompt, "[[KEYWORD]]", keyword, -1)

	response := CallChatGPT(prompt)

	response = MaskKeyword(response, keyword)
	response_slice := SplitMessage(response)
	return response_slice
}

func SplitMessage(message string) []string {
	reg := "[\n]"

	// 正規表現で文字列をスプリット
	message_slice := regexp.MustCompile(reg).Split(message, -1)
	var refined_slice []string
	for _, v := range message_slice {
		if v != "" {
			refined_slice = append(refined_slice, v)
		}
	}

	return refined_slice
}

func MaskKeyword(message string, keyword string) string {
	return strings.Replace(message, keyword, "[[MASK]]", -1)
}
