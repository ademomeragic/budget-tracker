using Xunit;
using Moq;
using Google.Cloud.Vision.V1;
using System.IO;
using System.Threading.Tasks;
using BudgetTracker.Infrastructure.Services;
using System.Threading;
using Google.Api.Gax.Grpc;

public class GoogleVisionServiceTests
{
    [Fact]
    public async Task ExtractTextFromImageAsync_Returns_Text_When_Successful()
    {
        // Arrange
        var mockClient = new Mock<ImageAnnotatorClient>();
        var testImage = Image.FromBytes(new byte[] { 0x1 }); // Dummy image
        var mockResponse = new TextAnnotation { Text = "Total: $12.34\nThank you!" };
        mockClient
            .Setup(c => c.DetectDocumentTextAsync(It.IsAny<Image>(), null, It.IsAny<CallSettings>()))
            .ReturnsAsync(mockResponse);


        var service = new GoogleVisionService(mockClient.Object);

        // Act
        using var stream = new MemoryStream(new byte[] { 0x1 }); // Simulated image stream
        var (text, error) = await service.ExtractTextFromImageAsync(stream);

        // Assert
        Assert.Null(error);
        Assert.Contains("Total: $12.34", text);
    }

    [Fact]
    public async Task ExtractTextFromImageAsync_Returns_Error_On_Exception()
    {
        // Arrange
        var mockClient = new Mock<ImageAnnotatorClient>();
        mockClient
            .Setup(c => c.DetectDocumentTextAsync(It.IsAny<Image>(), null, It.IsAny<CallSettings>()))
            .ThrowsAsync(new System.Exception("Mocked failure"));

        var service = new GoogleVisionService(mockClient.Object);

        // Act
        using var stream = new MemoryStream(new byte[] { 0x1 });
        var (text, error) = await service.ExtractTextFromImageAsync(stream);

        // Assert
        Assert.Equal("", text);
        Assert.NotNull(error);
        Assert.Contains("Mocked failure", error);
    }
}
