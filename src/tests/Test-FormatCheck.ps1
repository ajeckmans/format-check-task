. '.\format-check.ps1'

Describe "Format Check Script" {
    Context "Fetching existing threads" {
        It "Should call Invoke-RestMethod with the correct URI" {
            Mock Invoke-RestMethod { return @{ value = @() } }

            # Run your script function that calls Invoke-RestMethod here
            YourScriptFunction

            Assert-MockCalled Invoke-RestMethod -Exactly 1 -Scope It
        }

        It "Should handle paginated responses" {
            Mock Invoke-RestMethod { return @{ value = @(); continuationToken = "token" } } -Verifiable
            Mock Invoke-RestMethod { return @{ value = @() } } -Verifiable

            # Run your script function that calls Invoke-RestMethod here
            YourScriptFunction

            Assert-VerifiableMocks
        }
    }

    Context "Other functionalities" {
        # Other tests here
    }
}
