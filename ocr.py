def detect_handwritten_ocr(image_path_or_url, output_file):
    """Detects handwritten characters in the given image and writes the results to the output file.

    Args:
    image_path_or_url: The local path to the image file or URL of the image.
    output_file: The path to the output file where the OCR results will be written.
    """
    from google.cloud import vision_v1p3beta1 as vision
    import io
    import requests

    client = vision.ImageAnnotatorClient()

    if image_path_or_url.startswith('http'):
        # If the input is a URL, download the image from the URL
        image_data = requests.get(image_path_or_url).content
        image = vision.Image(content=image_data)
    else:
        # If the input is a local file path, load the image from the file
        with io.open(image_path_or_url, 'rb') as image_file:
            content = image_file.read()
        image = vision.Image(content=content)

    # Language hint codes for handwritten OCR:
    # en-t-i0-handwrit, mul-Latn-t-i0-handwrit
    # Note: Use only one language hint code per request for handwritten OCR.
    image_context = vision.ImageContext(language_hints=["en-t-i0-handwrit"])

    response = client.document_text_detection(image=image, image_context=image_context)

    with open(output_file, 'w') as file:
        file.write(f"Full Text: {response.full_text_annotation.text}\n")
        for page in response.full_text_annotation.pages:
            for block in page.blocks:
                file.write(f"\nBlock confidence: {block.confidence}\n")

                for paragraph in block.paragraphs:
                    file.write("Paragraph confidence: {}\n".format(paragraph.confidence))

                    for word in paragraph.words:
                        word_text = "".join([symbol.text for symbol in word.symbols])
                        file.write(
                            "Word text: {} (confidence: {})\n".format(
                                word_text, word.confidence
                            )
                        )

                        for symbol in word.symbols:
                            file.write(
                                "\tSymbol: {} (confidence: {})\n".format(
                                    symbol.text, symbol.confidence
                                )
                            )

    if response.error.message:
        raise Exception(
            "{}\nFor more info on error messages, check: "
            "https://cloud.google.com/apis/design/errors".format(response.error.message)
        )

def main():
    user_input = "/Users/shivachandran/Desktop/Vet Profile Template-1.png"
    detect_handwritten_ocr(user_input, 'output.txt')

main()